# 🌊 IATTC Data Explorer Hub

A comprehensive suite of interactive web applications for exploring and analyzing Inter-American Tropical Tuna Commission (IATTC) public domain fisheries data in the Eastern Pacific Ocean.

**[🔗 Live Demo](https://alexperex.me/IATTC-sample)**

## 🎯 Overview

The IATTC Data Explorer Hub provides a data crawler and 2 specialized visualization tools for analyzing Public Domain Data provided by [IATTC](https://iattc.org):

1. **🐟 Tuna Catch Data Explorer** - Comprehensive analysis of catch data by fishing nation and gear type
2. **🗺️ Purse Seine Geo Explorer** - Interactive spatial mapping of purse seine fishing activities
3. **@ Python Data Crawler** - A python tool that can function as a service that checks IATTC Public Domain Data for updates, downloads data sets and converts them to JSON format to be used by the web apps.

## 🚀 Applications

### 🐟 Tuna Catch Data Explorer
*Analysis of catch data by flag and gear type (2013-2023).*

**Key Features:**
- **Species Breakdown**: Yellowfin, Skipjack, Bigeye, Albacore, and Pacific Bluefin tuna
- **Fleet Analysis**: Compare catches by fishing nation/flag
- **Gear Comparison**: Purse Seine, Longline, Harpoon, and other fishing methods
- **Temporal Trends**: Multi-year trend analysis with interactive charts
- **Data Table**: Searchable, sortable records with detailed information

### 🗺️ Purse Seine Geo Explorer
*Interactive spatial mapping of Purse-seine fishery data.*

**Key Features:**
- **Interactive Maps**: Click grid cells for detailed catch information
- **Set Type Analysis**: Dolphin-associated, No-association, and Floating object sets
- **Heat Maps**: Visualize catch intensity and fishing effort patterns
- **Seasonal Patterns**: Monthly and seasonal fishing activity analysis
- **CPUE Analysis**: Catch per unit effort calculations and visualization

## 🚀 Quick Start

### Option 1: View Online
Visit the **[Live Demo](https://alexperex.me/IATTC-sample)** to start exploring immediately.

### Option 2: Local Setup
```bash
# Clone the repository
git clone https://github.com/alexperex/IATTC-sample.git
cd IATTC-sample

# Start a local web server
python -m http.server 8000

# Open your browser to http://localhost:8000
```

---

## 💾 Installation

### Setup Steps

1. **Download the Project**
   ```bash
   git clone https://github.com/alexperex/IATTC-sample.git
   cd IATTC-sample
   ```

2. **Add Your Data Files**
    
Follow the instructions of the script to grab your updated datasets. [More info...](./iattc-crawler/README.md)

3. **Start Local Server**
   ```bash
   # Choose one option:
   python -m http.server 8000    # Python
   ```

4. **Open in Browser**
   Navigate to `http://localhost:8000`

### Project Structure
```
IATTC-sample/
├── index.html                    # Landing page hub
├── styles.css                    # Landing page styles
├── script.js                     # Landing page interactions
├── catch-by-flag-data/           # Catch data application
│   ├── index.html
│   ├── styles.css
│   ├── data/CatchByFlagGear2013-2023.json
│   └── js/
│       ├── app.js
│       ├── config.js
│       ├── dataService.js
│       ├── chartRenderer.js
│       ├── filterManager.js
│       └── tableManager.js
└── geo-ps-data/                  # Geospatial application
    ├── index.html
    ├── styles.css
    ├── data/PublicPSTunaSetType2013-2023.json
    └── js/
        ├── app.js
        ├── config.js
        ├── dataService.js
        ├── mapService.js
        ├── chartService.js
        ├── filterManager.js
        └── tableManager.js
```
## 📊 Data Sources

### Primary Data Source
**Inter-American Tropical Tuna Commission (IATTC)**
- **Website**: [www.iattc.org](https://www.iattc.org/)

### Data Types
1. **Catch by Flag and Gear**: Total catch by fishing nation and gear type
2. **Purse Seine Set Types**: Spatial data with fishing method details

### Data Format
The applications expect JSON files with specific structures.

## 🔧 Technical Details

### Architecture
- **Data Layer**: DataService handles loading, filtering, and processing
- **Visualization Layer**: Chart.js for statistical charts, OpenLayers for maps
- **UI Layer**: FilterManager and TableManager for user interactions
- **Controller**: Main App class orchestrates all services

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Dataset**: Python, JSON
- **Charts**: Chart.js 3.9.1 for statistical visualizations
- **Maps**: OpenLayers 8.2.0 for interactive mapping

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Alejandro Perez**
- 🌐 Website: [alexperez.me](https://alexperez.me)
- 🐙 GitHub: [@halprez](https://github.com/halprez)

### Development Info
- **Built with**: Visual Studio Code
- **Development Time**: 8h
- **Languages**: HTML, CSS, JavaScript

## 🙏 Acknowledgments

### Data Provider: **Inter-American Tropical Tuna Commission (IATTC)**