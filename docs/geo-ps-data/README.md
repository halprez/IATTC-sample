# 🗺️ IATTC Purse Seine Geo Explorer

An interactive web application for exploring purse seine tuna fishing data in the Eastern Pacific Ocean (EPO). Built with vanilla JavaScript, OpenLayers, and Chart.js, this application provides comprehensive spatial and temporal analysis of IATTC fisheries data from 2013-2023.

## 🌊 Features

### 🗺️ Interactive Mapping
- **Spatial Visualization**: 1°×1° grid cells showing catch intensity across the EPO
- **Multiple Metrics**: Display total catch, number of sets, CPUE, or species-specific catches
- **Click Interactions**: Click cells for detailed catch information
- **Legend & Controls**: Dynamic legend and zoom/pan controls
- **Export Capabilities**: Save maps as high-resolution images

### 📊 Comprehensive Analytics
- **Species Composition**: Doughnut charts showing tuna species breakdown
- **Set Type Analysis**: Compare dolphin-associated, no-association, and floating object sets
- **Temporal Patterns**: Monthly, seasonal, and inter-annual trend analysis
- **Spatial Distribution**: Catch distribution by latitude bands
- **CPUE Analysis**: Catch per unit effort calculations and visualization

### 🔍 Advanced Filtering
- **Temporal Filters**: Filter by specific years and months
- **Set Type Filters**: Focus on specific fishing methods (DEL, NOA, OBJ)
- **Species Filters**: Analyze areas with significant catches of target species
- **Real-time Updates**: All visualizations update instantly with filter changes

### 📋 Data Management
- **Searchable Table**: Full-text search across all data fields
- **Sortable Columns**: Sort by any column (coordinates, catch, sets, etc.)
- **Export Functions**: Download filtered data as CSV or JSON
- **Detailed Records**: Click rows for comprehensive record details

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Web server for local development (Python, Node.js, PHP, etc.)

### Installation

1. **Download/Clone** the project files
2. **Add your data** to the `data/` folder
3. **Start a local server**
4. **Open in browser**

```bash
# Option 1: Python
python -m http.server 8000

# Then open http://localhost:8000
```

## 📁 Project Structure

```
purse-seine-geo/
├── index.html                           # Main application page
├── styles.css                           # Modern responsive styling  
├── README.md                            # This documentation
├── data/
│   └── PublicPSTunaSetType2013-2023.json # Your IATTC data file
└── js/
    ├── app.js                           # Main application controller
    ├── dataService.js                   # Data processing & management
    ├── mapService.js                    # OpenLayers map functionality
    ├── chartService.js                  # Chart.js visualizations
    ├── filterManager.js                 # Filter controls & logic
    └── tableManager.js                  # Data table management
```

## 📊 Data Format

The application expects JSON data with this structure:

```json
[
  {
    "Year": 2023,
    "Month": 12,
    "SetType": "DEL",
    "LatC1": 9.5,
    "LonC1": -106.5,
    "NumSets": 1,
    "ALB": 0.0,
    "BET": 0.0,
    "BKJ": 0.0,
    "BZX": 0.0,
    "FRZ": 0.0,
    "PBF": 0.0,
    "SKJ": 0.0,
    "TUN": 0.0,
    "YFT": 12.0
  }
]
```

### Field Descriptions

| Field | Description | Values |
|-------|-------------|---------|
| `Year` | Fishing year | 2013-2023 |
| `Month` | Fishing month | 1-12 |
| `SetType` | Purse seine set type | DEL, NOA, OBJ, UNA |
| `LatC1` | Latitude (center of 1° cell) | -30 to 40 |
| `LonC1` | Longitude (center of 1° cell) | -150 to -70 |
| `NumSets` | Number of fishing sets | 0+ |
| `ALB` | Albacore catch (tonnes) | 0+ |
| `BET` | Bigeye tuna catch (tonnes) | 0+ |
| `SKJ` | Skipjack tuna catch (tonnes) | 0+ |
| `YFT` | Yellowfin tuna catch (tonnes) | 0+ |
| `PBF` | Pacific bluefin catch (tonnes) | 0+ |
| ... | Other species fields | 0+ |

### Set Type Codes

- **DEL (Dolphin Associated)**: Sets made on dolphins
- **NOA (No Association)**: Sets made on unassociated tuna schools  
- **OBJ (Floating Object)**: Sets made on floating objects (FADs)
- **UNA (Unassociated)**: Sets on unassociated fish schools

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1-4` | Switch between tabs |
| `Ctrl/Cmd + R` | Reset all filters |
| `Ctrl/Cmd + F` | Focus search box |
| `Ctrl/Cmd + E` | Export filtered data |
| `Ctrl/Cmd + M` | Export map as image |
| `Ctrl/Cmd + H` | Show help modal |
| `Ctrl/Cmd + S` | Save current state |

## 🎨 User Interface

### Navigation Tabs

1. **Interactive Map**: Main spatial visualization with clickable grid cells
2. **Statistics**: Overview charts and summary statistics  
3. **Temporal Analysis**: Time series and seasonal pattern analysis
4. **Data Details**: Searchable and sortable data table

### Control Panel

- **Year Filter**: Select specific fishing years
- **Month Filter**: Focus on particular months/seasons
- **Set Type Filter**: Filter by fishing method
- **Species Filter**: Show areas with significant target species catches
- **Display Metric**: Choose what to visualize on the map

## 🔧 Technical Architecture

### SOLID Principles Implementation

- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Easy to extend without modifying existing code  
- **Liskov Substitution**: Consistent interfaces across services
- **Interface Segregation**: Specific, focused interfaces
- **Dependency Inversion**: Services depend on abstractions

### Core Classes

- **`DataService`**: Handles data loading, processing, and filtering
- **`MapService`**: Manages OpenLayers map and spatial visualization
- **`ChartService`**: Controls Chart.js visualizations and updates
- **`FilterManager`**: Manages filter state and observer notifications
- **`TableManager`**: Handles data table rendering and interactions
- **`PurseSeineApp`**: Main controller orchestrating all services

### External Dependencies

- **OpenLayers 8.2.0**: Interactive mapping and spatial visualization
- **Chart.js 3.9.1**: Statistical charts and data visualization
- **Inter Font**: Modern typography from Google Fonts

## 🌍 Deployment

### GitHub Pages

1. **Upload files** to your GitHub repository
2. **Include your data** in the `data/` folder
3. **Enable Pages** in repository settings
4. **Access** at `https://yourusername.github.io/repository-name`

### Other Hosting

The application works on any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

## 📱 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

### Required Features
- ES6+ JavaScript
- Fetch API
- CSS Grid & Flexbox
- Canvas API
- WebGL (for map rendering)

## 🔧 Customization

### Adding New Metrics

```javascript
// In dataService.js, add to getSpatialData()
case 'custom_metric':
    value = calculateCustomMetric(cell);
    break;
```

### Color Schemes

```javascript
// In mapService.js, modify colorScales
this.colorScales.custom_metric = {
    thresholds: [1, 10, 50, 100],
    colors: ['#fee2e2', '#fbbf24', '#f59e0b', '#dc2626']
};
```

### Additional Charts

```javascript
// In chartService.js, add new chart methods
renderCustomChart() {
    const data = this.dataService.getCustomData();
    // Chart implementation
}
```

## 📊 Data Sources & Attribution

### IATTC Data
- **Source**: [Inter-American Tropical Tuna Commission](https://www.iattc.org/)
- **License**: Public Domain
- **Coverage**: Eastern Pacific Ocean (EPO)
- **Resolution**: 1° × 1° spatial resolution
- **Temporal**: Monthly data from 2013-2023

### Recommended Citation
```
Inter-American Tropical Tuna Commission (IATTC). 
Public Domain Purse Seine Set-Type Data 2013-2023. 
Accessed via IATTC Purse Seine Geo Explorer, [Date].
```

## 🔍 Data Quality Notes

- **Zero Catches**: Records with zero catch are included to show fishing effort
- **Coordinates**: Represent center points of 1° × 1° cells
- **Confidentiality**: Some data may be aggregated to protect vessel confidentiality
- **Updates**: Data subject to revision as new information becomes available

## 🛠️ Development

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/purse-seine-geo.git
cd purse-seine-geo

# Add your data
cp /path/to/your/data.json data/PublicPSTunaSetType2013-2023.json

# Start development server
python -m http.server 8000

# Open browser
open http://localhost:8000
```

### Code Quality

- **ESLint**: Recommended for consistency
- **Prettier**: For code formatting  
- **JSDoc**: For comprehensive documentation
- **Testing**: Jest recommended for unit tests

### Performance Optimization

- **Data Chunking**: Large datasets processed in chunks
- **Lazy Loading**: Charts render only when tabs are active
- **Debouncing**: Search and filter operations are debounced
- **Memory Management**: Proper cleanup of chart instances

## 🐛 Troubleshooting

### Common Issues

**Map not loading**:
- Check browser console for JavaScript errors
- Verify OpenLayers CDN is accessible
- Ensure container element exists

**Data not displaying**:
- Verify JSON file format and location
- Check browser network tab for loading errors
- Validate data structure matches expected format

**Performance issues**:
- Large datasets (>10,000 records) may be slow
- Consider data aggregation or filtering
- Monitor browser memory usage

### Debug Information

```javascript
// Check application status
console.log(window.purseSeineApp.getStatus());

// Verify data loading
console.log(window.purseSeineApp.dataService.rawData.length);

// Check current filters
console.log(window.purseSeineApp.filterManager.getCurrentFilters());
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** SOLID principles and existing code style
4. **Add** JSDoc documentation
5. **Test** thoroughly with different datasets
6. **Submit** a pull request

### Development Guidelines

- Maintain modular architecture
- Follow existing naming conventions
- Add error handling for new features
- Ensure responsive design compatibility
- Document complex algorithms

## 📄 License

This project is open source under the [MIT License](LICENSE).

IATTC data is in the **Public Domain** as per IATTC data policy.

## 🙏 Acknowledgments

- **IATTC** for providing public access to valuable fisheries data
- **OpenLayers** community for excellent mapping capabilities
- **Chart.js** team for powerful and flexible charting
- **Fisheries researchers** and **conservation scientists** worldwide

## 📧 Support

For issues, questions, or feature requests:
- **GitHub Issues**: Report bugs or suggest enhancements
- **Documentation**: Check this README and inline code comments
- **Community**: Share with marine research and conservation communities

---

**Built with 🌊 for sustainable fisheries management and ocean conservation**

### Version History

- **v1.0.0**: Initial release with core mapping and analysis features
- **Future**: Enhanced species analysis, additional oceanographic layers, collaborative features