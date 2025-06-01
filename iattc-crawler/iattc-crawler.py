#!/usr/bin/env python3
"""
IATTC Data CrwalerÑ Monitors IATTC Public domain data site for changes, downloads zip files, and converts CSV to JSON

Author: Alejandro Perez
"""

import os
import json
import csv
import zipfile
import hashlib
import logging
import requests
import schedule
import time
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urljoin, urlparse
import re
from concurrent.futures import ThreadPoolExecutor, as_completed


# =============================================================================
# CONFIGURATION & DATA MODELS
# =============================================================================

@dataclass
class Config:
    """Configuration class following Single Responsibility Principle"""
    base_url: str = "https://iattc.org/en-US/Data/Public-domain"
    download_dir: str = "./downloads"
    output_dir: str = "./json_output"
    log_file: str = "./iattc_monitor.log"
    cache_file: str = "./site_cache.json"
    check_interval_minutes: int = 60
    max_workers: int = 4
    user_agent: str = "IATTC-Data-Monitor/1.0"
    request_timeout: int = 30
    retry_attempts: int = 3


@dataclass
class FileInfo:
    """Data model for file information"""
    url: str
    filename: str
    size: Optional[int] = None
    last_modified: Optional[str] = None
    checksum: Optional[str] = None


# =============================================================================
# INTERFACES (Dependency Inversion Principle)
# =============================================================================

class IWebsiteMonitor(ABC):
    """Interface for website monitoring strategies"""
    
    @abstractmethod
    def detect_changes(self, url: str) -> bool:
        pass
    
    @abstractmethod
    def get_zip_files(self, url: str) -> List[FileInfo]:
        pass


class IFileDownloader(ABC):
    """Interface for file downloading strategies"""
    
    @abstractmethod
    def download(self, file_info: FileInfo, destination: Path) -> bool:
        pass


class IFileProcessor(ABC):
    """Interface for file processing strategies"""
    
    @abstractmethod
    def can_process(self, file_path: Path) -> bool:
        pass
    
    @abstractmethod
    def process(self, file_path: Path, output_dir: Path) -> List[Path]:
        pass


class INotificationService(ABC):
    """Interface for notification strategies"""
    
    @abstractmethod
    def notify(self, message: str, severity: str = "INFO") -> None:
        pass


# =============================================================================
# CONCRETE IMPLEMENTATIONS
# =============================================================================

class WebsiteMonitor(IWebsiteMonitor):
    """Concrete implementation of website monitoring"""
    
    def __init__(self, config: Config):
        self.config = config
        self.session = self._create_session()
        self.cache_file = Path(config.cache_file)
        self.logger = logging.getLogger(__name__)
    
    def _create_session(self) -> requests.Session:
        """Create configured HTTP session"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': self.config.user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        })
        return session
    
    def detect_changes(self, url: str) -> bool:
        """Detect if website has changed since last check"""
        try:
            response = self._make_request(url)
            if not response:
                return False
            
            current_hash = hashlib.md5(response.content).hexdigest()
            previous_hash = self._load_cache().get('page_hash')
            
            if current_hash != previous_hash:
                self._save_cache({'page_hash': current_hash, 'last_check': datetime.now().isoformat()})
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error detecting changes: {e}")
            return False
    
    def get_zip_files(self, url: str) -> List[FileInfo]:
        """Extract zip file information from website"""
        try:
            response = self._make_request(url)
            if not response:
                return []
            
            zip_files = []
            zip_pattern = re.compile(r'href=["\']([^"\']*\.zip)["\']', re.IGNORECASE)
            
            for match in zip_pattern.finditer(response.text):
                file_url = urljoin(url, match.group(1))
                filename = os.path.basename(urlparse(file_url).path)
                
                file_info = FileInfo(
                    url=file_url,
                    filename=filename
                )
                
                # Get additional file metadata
                self._enrich_file_info(file_info)
                zip_files.append(file_info)
            
            self.logger.info(f"Found {len(zip_files)} zip files")
            return zip_files
            
        except Exception as e:
            self.logger.error(f"Error getting zip files: {e}")
            return []
    
    def _make_request(self, url: str) -> Optional[requests.Response]:
        """Make HTTP request with retry logic"""
        for attempt in range(self.config.retry_attempts):
            try:
                response = self.session.get(url, timeout=self.config.request_timeout)
                response.raise_for_status()
                return response
            except requests.RequestException as e:
                self.logger.warning(f"Request attempt {attempt + 1} failed: {e}")
                if attempt == self.config.retry_attempts - 1:
                    self.logger.error(f"All request attempts failed for {url}")
                time.sleep(2 ** attempt)  # Exponential backoff
        return None
    
    def _enrich_file_info(self, file_info: FileInfo) -> None:
        """Get additional metadata for file"""
        try:
            response = self.session.head(file_info.url, timeout=self.config.request_timeout)
            file_info.size = int(response.headers.get('content-length', 0))
            file_info.last_modified = response.headers.get('last-modified')
        except Exception as e:
            self.logger.warning(f"Could not get metadata for {file_info.filename}: {e}")
    
    def _load_cache(self) -> Dict[str, Any]:
        """Load cache from file"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.warning(f"Could not load cache: {e}")
        return {}
    
    def _save_cache(self, data: Dict[str, Any]) -> None:
        """Save cache to file"""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            self.logger.error(f"Could not save cache: {e}")


class FileDownloader(IFileDownloader):
    """Concrete implementation of file downloading"""
    
    def __init__(self, config: Config):
        self.config = config
        self.session = self._create_session()
        self.logger = logging.getLogger(__name__)
    
    def _create_session(self) -> requests.Session:
        """Create configured HTTP session for downloads"""
        session = requests.Session()
        session.headers.update({'User-Agent': self.config.user_agent})
        return session
    
    def download(self, file_info: FileInfo, destination: Path) -> bool:
        """Download file with progress tracking and validation"""
        try:
            destination.parent.mkdir(parents=True, exist_ok=True)
            
            # Skip if file already exists and is valid
            if destination.exists() and self._validate_existing_file(destination, file_info):
                self.logger.info(f"File {file_info.filename} already exists and is valid")
                return True
            
            self.logger.info(f"Downloading {file_info.filename}...")
            
            response = self.session.get(
                file_info.url, 
                stream=True, 
                timeout=self.config.request_timeout
            )
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(destination, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        self._log_progress(downloaded_size, total_size, file_info.filename)
            
            # Validate download
            if self._validate_download(destination, file_info):
                self.logger.info(f"Successfully downloaded {file_info.filename}")
                return True
            else:
                self.logger.error(f"Download validation failed for {file_info.filename}")
                destination.unlink(missing_ok=True)
                return False
                
        except Exception as e:
            self.logger.error(f"Error downloading {file_info.filename}: {e}")
            return False
    
    def _validate_existing_file(self, file_path: Path, file_info: FileInfo) -> bool:
        """Validate existing file against metadata"""
        if not file_path.exists():
            return False
        
        # Check file size if available
        if file_info.size and file_path.stat().st_size != file_info.size:
            return False
        
        # Additional validation can be added here (checksums, etc.)
        return True
    
    def _validate_download(self, file_path: Path, file_info: FileInfo) -> bool:
        """Validate downloaded file"""
        if not file_path.exists():
            return False
        
        # Check file size
        if file_info.size and file_path.stat().st_size != file_info.size:
            return False
        
        # Verify it's a valid zip file
        try:
            with zipfile.ZipFile(file_path, 'r') as zf:
                zf.testzip()
            return True
        except zipfile.BadZipFile:
            return False
    
    def _log_progress(self, downloaded: int, total: int, filename: str) -> None:
        """Log download progress"""
        if total > 0:
            percent = (downloaded / total) * 100
            if percent % 25 == 0:  # Log every 25%
                self.logger.info(f"Download progress for {filename}: {percent:.0f}%")


class ZipProcessor(IFileProcessor):
    """Concrete implementation for processing ZIP files"""
    
    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger(__name__)
    
    def can_process(self, file_path: Path) -> bool:
        """Check if file can be processed"""
        return file_path.suffix.lower() == '.zip'
    
    def process(self, file_path: Path, output_dir: Path) -> List[Path]:
        """Extract ZIP file and return list of extracted files"""
        extracted_files = []
        
        try:
            extract_dir = output_dir / file_path.stem
            extract_dir.mkdir(parents=True, exist_ok=True)
            
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
                
                for member in zip_ref.namelist():
                    extracted_path = extract_dir / member
                    if extracted_path.is_file():
                        extracted_files.append(extracted_path)
            
            self.logger.info(f"Extracted {len(extracted_files)} files from {file_path.name}")
            return extracted_files
            
        except Exception as e:
            self.logger.error(f"Error processing ZIP file {file_path}: {e}")
            return []


class CSVToJSONConverter(IFileProcessor):
    """Concrete implementation for converting CSV to JSON"""
    
    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger(__name__)
    
    def can_process(self, file_path: Path) -> bool:
        """Check if file is a CSV"""
        return file_path.suffix.lower() == '.csv'
    
    def process(self, file_path: Path, output_dir: Path) -> List[Path]:
        """Convert CSV to JSON"""
        try:
            output_dir.mkdir(parents=True, exist_ok=True)
            json_path = output_dir / f"{file_path.stem}.json"
            
            data = self._read_csv(file_path)
            self._write_json(data, json_path)
            
            self.logger.info(f"Converted {file_path.name} to {json_path.name}")
            return [json_path]
            
        except Exception as e:
            self.logger.error(f"Error converting CSV {file_path}: {e}")
            return []
    
    def _read_csv(self, file_path: Path) -> List[Dict[str, Any]]:
        """Read CSV file with intelligent handling"""
        data = []
        
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding, newline='') as csvfile:
                    # Detect delimiter
                    sample = csvfile.read(1024)
                    csvfile.seek(0)
                    
                    sniffer = csv.Sniffer()
                    delimiter = sniffer.sniff(sample).delimiter
                    
                    reader = csv.DictReader(csvfile, delimiter=delimiter)
                    data = [self._clean_row(row) for row in reader]
                    break
                    
            except UnicodeDecodeError:
                continue
            except Exception as e:
                self.logger.warning(f"Error reading CSV with encoding {encoding}: {e}")
                continue
        
        if not data:
            raise Exception("Could not read CSV file with any encoding")
        
        return data
    
    def _clean_row(self, row: Dict[str, str]) -> Dict[str, Any]:
        """Clean and type-convert row data"""
        cleaned = {}
        
        for key, value in row.items():
            # Clean key
            clean_key = key.strip() if key else 'unnamed_column'
            
            # Clean and convert value
            if value is None or value.strip() == '':
                cleaned[clean_key] = None
            else:
                cleaned[clean_key] = self._convert_value(value.strip())
        
        return cleaned
    
    def _convert_value(self, value: str) -> Any:
        """Attempt to convert string value to appropriate type"""
        # Try integer
        try:
            return int(value)
        except ValueError:
            pass
        
        # Try float
        try:
            return float(value)
        except ValueError:
            pass
        
        # Try boolean
        if value.lower() in ('true', 'false', 'yes', 'no', '1', '0'):
            return value.lower() in ('true', 'yes', '1')
        
        # Return as string
        return value
    
    def _write_json(self, data: List[Dict[str, Any]], output_path: Path) -> None:
        """Write data to JSON file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)


class LoggingNotificationService(INotificationService):
    """Simple logging-based notification service"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def notify(self, message: str, severity: str = "INFO") -> None:
        """Send notification via logging"""
        if severity == "ERROR":
            self.logger.error(message)
        elif severity == "WARNING":
            self.logger.warning(message)
        else:
            self.logger.info(message)


# =============================================================================
# MAIN ORCHESTRATOR (Open/Closed Principle)
# =============================================================================

class IATTCDataMonitor:
    """Main orchestrator following SOLID principles"""
    
    def __init__(self, 
                 config: Config,
                 website_monitor: IWebsiteMonitor,
                 file_downloader: IFileDownloader,
                 file_processors: List[IFileProcessor],
                 notification_service: INotificationService):
        
        self.config = config
        self.website_monitor = website_monitor
        self.file_downloader = file_downloader
        self.file_processors = file_processors
        self.notification_service = notification_service
        self.logger = logging.getLogger(__name__)
        
        # Create directories
        Path(config.download_dir).mkdir(parents=True, exist_ok=True)
        Path(config.output_dir).mkdir(parents=True, exist_ok=True)
    
    def run_monitoring_cycle(self) -> None:
        """Run a single monitoring cycle"""
        try:
            self.logger.info("Starting monitoring cycle...")
            
            # Check for changes
            if not self.website_monitor.detect_changes(self.config.base_url):
                self.logger.info("No changes detected")
                return
            
            self.notification_service.notify("Changes detected on IATTC website")
            
            # Get available ZIP files
            zip_files = self.website_monitor.get_zip_files(self.config.base_url)
            if not zip_files:
                self.logger.warning("No ZIP files found")
                return
            
            # Download files concurrently
            downloaded_files = self._download_files_concurrently(zip_files)
            
            # Process files
            processed_files = self._process_files(downloaded_files)
            
            success_msg = f"Successfully processed {len(processed_files)} files"
            self.logger.info(success_msg)
            self.notification_service.notify(success_msg)
            
        except Exception as e:
            error_msg = f"Error in monitoring cycle: {e}"
            self.logger.error(error_msg)
            self.notification_service.notify(error_msg, "ERROR")
    
    def _download_files_concurrently(self, zip_files: List[FileInfo]) -> List[Path]:
        """Download files using thread pool"""
        downloaded_files = []
        
        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            future_to_file = {
                executor.submit(
                    self.file_downloader.download,
                    file_info,
                    Path(self.config.download_dir) / file_info.filename
                ): file_info for file_info in zip_files
            }
            
            for future in as_completed(future_to_file):
                file_info = future_to_file[future]
                try:
                    if future.result():
                        file_path = Path(self.config.download_dir) / file_info.filename
                        downloaded_files.append(file_path)
                except Exception as e:
                    self.logger.error(f"Error downloading {file_info.filename}: {e}")
        
        return downloaded_files
    
    def _process_files(self, file_paths: List[Path]) -> List[Path]:
        """Process files through the processor chain"""
        all_processed_files = []
        
        for file_path in file_paths:
            processed_files = self._process_single_file(file_path)
            all_processed_files.extend(processed_files)
        
        return all_processed_files
    
    def _process_single_file(self, file_path: Path) -> List[Path]:
        """Process a single file through appropriate processors"""
        processed_files = []
        
        # Find appropriate processor
        for processor in self.file_processors:
            if processor.can_process(file_path):
                try:
                    results = processor.process(file_path, Path(self.config.output_dir))
                    processed_files.extend(results)
                    
                    # If it's a ZIP processor, recursively process extracted files
                    if isinstance(processor, ZipProcessor):
                        for extracted_file in results:
                            sub_processed = self._process_single_file(extracted_file)
                            processed_files.extend(sub_processed)
                    
                except Exception as e:
                    self.logger.error(f"Error processing {file_path} with {processor.__class__.__name__}: {e}")
        
        return processed_files
    
    def start_scheduled_monitoring(self) -> None:
        """Start scheduled monitoring"""
        self.logger.info(f"Starting scheduled monitoring every {self.config.check_interval_minutes} minutes")
        
        schedule.every(self.config.check_interval_minutes).minutes.do(self.run_monitoring_cycle)
        
        # Run initial cycle
        self.run_monitoring_cycle()
        
        # Keep running
        while True:
            schedule.run_pending()
            time.sleep(60)


# =============================================================================
# FACTORY & SETUP (Dependency Injection)
# =============================================================================

def setup_logging(config: Config) -> None:
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(config.log_file),
            logging.StreamHandler()
        ]
    )


def create_monitor(config: Config) -> IATTCDataMonitor:
    """Factory function to create configured monitor (Dependency Injection)"""
    
    # Create implementations
    website_monitor = WebsiteMonitor(config)
    file_downloader = FileDownloader(config)
    notification_service = LoggingNotificationService()
    
    # Create processors (easily extensible)
    file_processors = [
        ZipProcessor(config),
        CSVToJSONConverter(config)
    ]
    
    # Create and return monitor
    return IATTCDataMonitor(
        config=config,
        website_monitor=website_monitor,
        file_downloader=file_downloader,
        file_processors=file_processors,
        notification_service=notification_service
    )


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    """Main entry point"""
    # Load configuration (could be from file, environment, etc.)
    config = Config()
    
    # Setup logging
    setup_logging(config)
    logger = logging.getLogger(__name__)
    
    try:
        # Create monitor
        monitor = create_monitor(config)
        
        # Start monitoring
        logger.info("IATTC Data Monitor starting...")
        monitor.start_scheduled_monitoring()
        
    except KeyboardInterrupt:
        logger.info("Monitor stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()