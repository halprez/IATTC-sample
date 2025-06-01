# IATTC Tuna Catch Data Explorer

An interactive web application for exploring tuna catch data from the Inter-American Tropical Tuna Commission (IATTC). This application provides comprehensive data visualization and analysis tools for fisheries research and conservation efforts.

## 🐟 Features

### 📊 Interactive Visualizations
- **Species Distribution**: Doughnut chart showing catch composition by species
- **Flag Analysis**: Bar chart comparing catches by fishing nation/flag
- **Temporal Trends**: Line charts showing catch trends over time (2013-2023)
- **Gear Comparison**: Pie chart of fishing gear type usage
- **Multi-dimensional Analysis**: Comparative charts with customizable metrics

### 🔍 Advanced Filtering
- **Multi-select Filters**: Year range, flags, gear types, and species
- **Real-time Updates**: All visualizations update instantly with filter changes
- **Filter Presets**: Quick access to common filter combinations
- **Search Functionality**: Full-text search across all data fields

### 📋 Data Management
- **Sortable Tables**: Click column headers to sort data
- **Pagination**: Efficient handling of large datasets
- **Export Capabilities**: Download filtered data as CSV
- **Detailed Records**: Click rows for comprehensive record details

### 🎯 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Keyboard Shortcuts**: Power-user friendly navigation
- **Dark Mode Support**: Automatic dark theme detection
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Web server (for local development: Python's `http.server`, Node.js `live-server`, etc.)

### Installation

1. **Clone or download** this repository
2. **Create the data folder** and add your JSON data file
3. **Set up a local web server** (required for loading JSON data)
4. **Open in browser**

### Quick Setup

```bash
# Option 1: Using Python (Python 3)
python -m http.server 8000

# Option 2: Using Node.js (install live-server globally)
npm install -g live-server
live-server

# Option 3: Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
iattc-tuna-explorer/
├── index.html                 # Main application page
├── styles.css                 # All styling and responsive design
├── README.md                  # This documentation file
├── data/
│   └── CatchByFlagGear2013-2023.json  # Main dataset (you provide)
└── js/
    ├── app.js                 # Main application controller
    ├── dataService.js         # Data management and processing
    ├── chartRenderer.js       # Chart visualization service
    ├── filterManager.js       # Filter functionality
    └── tableManager.js        # Data table management
```

## 📊 Data Format

The application expects a JSON file with the following structure:

```json
[
  {
    "AnoYear": 2023,
    "BanderaFlag": "MEX",
    "ArteGear": "PS",
    "EspeciesSpecies": "YFT",
    "t": 143107
  }
]
```

### Field Descriptions

| Field | Description | Example Values |
|-------|-------------|----------------|
| `AnoYear` | Catch year | 2013-2023 |
| `BanderaFlag` | Flag state/country code | MEX, USA, TWN, PAN |
| `ArteGear` | Fishing gear type | PS, LL, HAR, GN |
| `EspeciesSpecies` | Species code | YFT, SKJ, BET, ALB |
| `t` | Catch amount in tonnes | 0-150000 |

### Supported Codes

**Species Codes**:
- `ALB` - Albacore
- `BET` - Bigeye Tuna  
- `YFT` - Yellowfin Tuna
- `SKJ` - Skipjack Tuna
- `PBF` - Pacific Bluefin Tuna
- `SWO` - Swordfish
- `DOX` - Dolphinfish
- [Complete list in dataService.js]

**Gear Types**:
- `PS` - Purse Seine
- `LL` - Longline
- `HAR` - Harpoon
- `GN` - Gillnet
- `RG` - Rod and Reel
- [Complete list in dataService.js]

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1-4` | Switch between tabs |
| `Ctrl/Cmd + R` | Reset all filters |
| `Ctrl/Cmd + F` | Focus search (in Details tab) |
| `Ctrl/Cmd + E` | Export data as CSV |
| `Ctrl/Cmd + H` | Show help modal |
| `Ctrl/Cmd + S` | Save current state |

## 🎨 Customization

### Adding New Visualizations

```javascript
// In chartRenderer.js
renderCustomChart() {
    const data = this.dataService.getAggregatedData('customField');
    // Chart implementation
}
```

### Adding New Filters

```javascript
// In filterManager.js
addCustomFilter(filterType, options) {
    // Filter implementation
}
```

### Theming

Modify CSS custom properties in `styles.css`:

```css
:root {
    --primary-color: #your-color;
    --accent-color: #your-accent;
    /* etc. */
}
```

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
- CSS Grid
- CSS Custom Properties
- Canvas API (for charts)

## 🔒 Data Privacy

- **Client-Side Only**: All processing happens in the browser
- **No Data Collection**: No analytics or tracking
- **Local Storage**: Optional state saving (user controlled)
- **Public Domain**: Works with IATTC public domain data

## 🌍 GitHub Pages Deployment

### Automatic Deployment

1. **Fork/Clone** this repository to your GitHub account
2. **Add your data** to the `data/` folder
3. **Enable GitHub Pages** in repository settings
4. **Select source**: Deploy from main branch
5. **Access**: Your app will be available at `https://yourusername.github.io/repository-name`

### Manual Deployment

1. **Build** your application locally
2. **Test** thoroughly with your data
3. **Commit** all files including data
4. **Push** to GitHub
5. **Configure** GitHub Pages

### GitHub Pages Configuration

In your repository settings:
- Source: Deploy from a branch
- Branch: `main` (or `gh-pages`)
- Folder: `/ (root)`

## 🛠️ Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/iattc-tuna-explorer.git
cd iattc-tuna-explorer

# Add your data file
mkdir -p data
cp /path/to/your/CatchByFlagGear2013-2023.json data/

# Start development server
python -m http.server 8000

# Open browser
open http://localhost:8000
```

### Code Quality

- **ESLint**: Recommended for code consistency
- **Prettier**: For code formatting
- **JSDoc**: For documentation
- **Modular Architecture**: Following SOLID principles

### Performance Considerations

- **Lazy Loading**: Charts render only when tabs are active
- **Efficient Filtering**: Optimized data processing
- **Responsive Charts**: Charts resize with viewport
- **Memory Management**: Proper cleanup of chart instances

## 🔄 Data Updates

To update with new IATTC data:

1. **Download** latest data from IATTC
2. **Convert** to JSON format (if needed)
3. **Validate** data structure matches expected format
4. **Replace** the data file
5. **Test** application functionality
6. **Deploy** updated version

## 🐛 Troubleshooting

### Common Issues

**Data not loading**:
- Ensure you're using a web server (not file://)
- Check data file path and format
- Verify JSON syntax

**Charts not displaying**:
- Check browser console for errors
- Ensure Chart.js is loading properly
- Verify canvas elements exist

**Filters not working**:
- Check data field names match expected format
- Verify filter options are populated
- Test with browser developer tools

### Debug Mode

Open browser developer tools and check:
```javascript
// Check application status
window.iattcApp.getStatus()

// Check data loading
window.iattcApp.dataService.rawData.length

// Check current filters
window.iattcApp.filterManager.getCurrentFilters()
```

## 📝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes following SOLID principles
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines

- Follow existing code style
- Add JSDoc comments for new functions
- Test with different data sets
- Ensure responsive design
- Maintain accessibility standards

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

The IATTC data used with this application is in the **Public Domain** as per IATTC data policy.

## 🙏 Acknowledgments

- **IATTC** (Inter-American Tropical Tuna Commission) for providing public domain fisheries data
- **Chart.js** for excellent charting capabilities
- **Modern CSS** techniques for responsive design
- **Ocean conservation community** for inspiration

## 📧 Support

For issues, questions, or contributions:
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check this README and code comments
- **Community**: Share with fisheries research community

---

**Built with 🌊 for ocean conservation and sustainable fisheries management**