# IATTC Data Craler 

## Set up Virtual Environment (Recommended)

### Create virtual environment
python -m venv .iattc_venv

#### Activate virtual environment
##### On Windows:
.iattc_venv\Scripts\activate

##### On macOS/Linux:
source .iattc__venv/bin/activate

##### Verify activation (should show virtual environment path)
which python

## Requirements File (requirements.txt)

```bash
# Install dependencies
pip install -r requirements.txt

# Run the monitor
python iattc_crawler.py
```

## 🔧 Configuration Options

```python
@dataclass
class Config:
    base_url: str = "https://iattc.org/en-US/Data/Public-domain"
    download_dir: str = "./downloads"
    output_dir: str = "./json_output"
    log_file: str = "./iattc_crawler.log"
    cache_file: str = "./site_cache.json"
    check_interval_minutes: int = 60  # Check every hour
    max_workers: int = 4  # Concurrent downloads
    user_agent: str = "IATTC-Data-Monitor/1.0"
    request_timeout: int = 30
    retry_attempts: int = 3
```

## How It Works

1. **Change Detection**: Monitors the IATTC website for changes using MD5 hashing
2. **ZIP Discovery**: Scans HTML for ZIP file links using regex patterns
3. **Concurrent Downloads**: Downloads multiple files simultaneously with progress tracking
4. **ZIP Processing**: Extracts ZIP files and processes contents recursively
5. **CSV Conversion**: Converts CSV files to JSON with intelligent type detection
6. **Scheduling**: Runs on a configurable schedule using the `schedule` library

## Advanced Usage

### Custom Configuration

```python
# Create custom configuration
config = Config(
    base_url="https://your-custom-site.com/data",
    check_interval_minutes=30,  # Check every 30 minutes
    max_workers=8,  # Increase concurrent downloads
    download_dir="./custom_downloads"
)

# Create monitor with custom config
monitor = create_monitor(config)
monitor.start_scheduled_monitoring()
```

## Monitoring & Debugging

### Log Levels
- **INFO**: Normal operations, progress updates
- **WARNING**: Non-critical issues (encoding problems, metadata missing)
- **ERROR**: Serious errors that prevent processing

### Cache Management
The monitor maintains a cache file (`site_cache.json`) to track:
- Website content hash for change detection
- Last check timestamp

### File Validation
- Downloads are validated for size and ZIP integrity
- Existing files are checked before re-downloading
- Corrupted downloads are automatically retried

## Error Handling & Resilience

- **Retry Logic**: Automatic retries with exponential backoff
- **Graceful Degradation**: Continues processing even if some files fail
- **Concurrent Safety**: Thread-safe operations for parallel downloads
- **Resource Management**: Proper cleanup of temporary files and network connections

## Performance Considerations

- **Concurrent Downloads**: Configurable worker pool for parallel processing
- **Streaming Downloads**: Large files are downloaded in chunks to manage memory
- **Intelligent Caching**: Avoids re-downloading unchanged files
- **Progress Tracking**: Detailed logging for long-running operations

## Security Features

- **Request Timeouts**: Prevents hanging on unresponsive servers
- **User Agent**: Identifies the application appropriately
- **Input Validation**: Validates file paths and URLs
- **Safe Extraction**: Validates ZIP files before extraction

## Testing Strategy

### TODO: Implement Unit Tests

