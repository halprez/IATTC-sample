/**
 * IATTC Purse Seine Geo Explorer - Configuration File
 * 
 * Customize the application behavior by modifying the values below.
 * This file follows the Open/Closed Principle - open for extension, closed for modification.
 */

const PURSE_SEINE_CONFIG = {
    
    // ===== DATA CONFIGURATION =====
    data: {
        // Path to your main data file
        filepath: './data/PublicPSTunaSetType2013-2023.json',
        
        // Fallback sample data file (if main file fails to load)
        sampleFilepath: 'data/PublicPSTunaSetType2013-2023_sample.json',
        
        // Maximum file size warning (in MB)
        maxFileSizeMB: 25,
        
        // Data validation settings
        validation: {
            required_fields: ['Year', 'Month', 'LatC1', 'LonC1', 'SetType', 'NumSets'],
            min_year: 2013,
            max_year: new Date().getFullYear(),
            coordinate_bounds: {
                north: 40,
                south: -30,
                east: -70,
                west: -150
            }
        }
    },

    // ===== UI CONFIGURATION =====
    ui: {
        // Application title and metadata
        title: '🗺️ IATTC Purse Seine Geo Explorer',
        subtitle: 'Interactive mapping of purse seine tuna catches in the Eastern Pacific Ocean (2013-2023)',
        
        // Default active tab on load
        defaultTab: 'map',
        
        // Default display metric for map
        defaultDisplayMetric: 'total_catch',
        
        // Enable/disable features
        features: {
            exportData: true,
            exportMap: true,
            keyboardShortcuts: true,
            helpModal: true,
            darkModeDetection: true,
            animations: true,
            responsiveCharts: true,
            cellDetailsPopup: true,
            advancedFiltering: true
        },
        
        // Pagination settings
        pagination: {
            itemsPerPage: 50,
            showPagination: true
        },
        
        // Animation settings
        animations: {
            duration: 750,
            easing: 'easeInOutQuart',
            mapTransition: 300
        }
    },

    // ===== MAP CONFIGURATION =====
    map: {
        // Default map view
        center: [-110, 5], // [longitude, latitude]
        zoom: 3,
        minZoom: 2,
        maxZoom: 5,
        
        // Eastern Pacific Ocean bounds
        bounds: {
            north: 40,
            south: -30,
            east: -70,
            west: -180
        },
        
        // Base map layers
        baseLayers: {
            osm: {
                enabled: true,
                opacity: 0.6,
                url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
        },
        
        // Grid cell styling
        gridCells: {
            borderWidth: 1,
            opacity: 0.8,
            hoverOpacity: 0.9
        },
        
        // Color scales for different metrics
        colorScales: {
            total_catch: {
                thresholds: [1, 50, 200, 1000],
                colors: ['#fee2e2', '#fbbf24', '#f59e0b', '#dc2626'],
                labels: ['Low', 'Medium', 'High', 'Very High']
            },
            num_sets: {
                thresholds: [1, 5, 15, 50],
                colors: ['#dbeafe', '#60a5fa', '#3b82f6', '#1d4ed8'],
                labels: ['Few', 'Some', 'Many', 'Very Many']
            },
            cpue: {
                thresholds: [0.1, 5, 15, 50],
                colors: ['#d1fae5', '#34d399', '#10b981', '#059669'],
                labels: ['Low CPUE', 'Medium CPUE', 'High CPUE', 'Very High CPUE']
            },
            yft_catch: {
                thresholds: [1, 25, 100, 400],
                colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706'],
                labels: ['Low YFT', 'Medium YFT', 'High YFT', 'Very High YFT']
            },
            skj_catch: {
                thresholds: [1, 30, 120, 500],
                colors: ['#e0f2fe', '#0ea5e9', '#0284c7', '#0369a1'],
                labels: ['Low SKJ', 'Medium SKJ', 'High SKJ', 'Very High SKJ']
            }
        },
        
        // Map controls
        controls: {
            zoom: true,
            scaleLine: true,
            fullScreen: true,
            mousePosition: false,
            overview: false
        }
    },

    // ===== CHART CONFIGURATION =====
    charts: {
        // Default chart colors
        colorPalette: [
            '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
            '#db2777', '#0891b2', '#65a30d', '#dc2626', '#9333ea',
            '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'
        ],
        
        // Chart-specific settings
        species: {
            type: 'doughnut',
            maxItems: 8,
            showPercentages: true,
            position: 'right'
        },
        
        setType: {
            type: 'bar',
            sortDescending: true,
            showSets: true
        },
        
        temporal: {
            type: 'line',
            fillArea: true,
            showPoints: true,
            smoothLines: true
        },
        
        monthly: {
            type: 'line',
            showBothAxes: true,
            fillArea: true
        },
        
        spatial: {
            type: 'bar',
            orientation: 'horizontal',
            latitudeBins: 5 // degrees
        },
        
        seasonal: {
            type: 'radar',
            fillArea: true
        },
        
        // Global chart options
        responsive: true,
        maintainAspectRatio: false,
        fontSize: 12,
        fontFamily: 'Inter, sans-serif'
    },

    // ===== FILTER CONFIGURATION =====
    filters: {
        // Enable/disable specific filter types
        enabled: {
            year: true,
            month: true,
            setType: true,
            species: true
        },
        
        // Filter presets for quick selection
        presets: {
            'recent-high-activity': {
                name: 'Recent High Activity (2023, DEL, YFT)',
                filters: {
                    year: '2023',
                    setType: 'DEL',
                    species: 'YFT'
                }
            },
            'skipjack-focus': {
                name: 'Skipjack Tuna Focus',
                filters: {
                    species: 'SKJ'
                }
            },
            'dolphin-sets': {
                name: 'Dolphin Associated Sets',
                filters: {
                    setType: 'DEL'
                }
            },
            'peak-season': {
                name: 'Peak Season (June-August)',
                filters: {
                    month: ['6', '7', '8']
                }
            },
            'no-association': {
                name: 'No Association Sets',
                filters: {
                    setType: 'NOA'
                }
            },
            'floating-objects': {
                name: 'Floating Object Sets',
                filters: {
                    setType: 'OBJ'
                }
            },
            'high-cpue': {
                name: 'High CPUE Areas',
                description: 'Areas with catch per set > 20 tonnes'
            }
        },
        
        // Default selections (empty = all selected)
        defaults: {
            year: '',
            month: '',
            setType: '',
            species: ''
        }
    },

    // ===== SPECIES CONFIGURATION =====
    species: {
        // Species information with colors and details
        info: {
            'ALB': { 
                name: 'Albacore', 
                scientific: 'Thunnus alalunga',
                color: '#8b5cf6',
                description: 'North Pacific albacore tuna'
            },
            'BET': { 
                name: 'Bigeye Tuna', 
                scientific: 'Thunnus obesus',
                color: '#dc2626',
                description: 'Bigeye tuna, important commercial species'
            },
            'BKJ': { 
                name: 'Black Skipjack', 
                scientific: 'Euthynnus lineatus',
                color: '#374151',
                description: 'Black skipjack tuna'
            },
            'BZX': { 
                name: 'Mixed Bycatch', 
                scientific: 'Various species',
                color: '#6b7280',
                description: 'Mixed bycatch species'
            },
            'FRZ': { 
                name: 'Frigate Tuna', 
                scientific: 'Auxis thazard',
                color: '#059669',
                description: 'Frigate tuna, smaller tuna species'
            },
            'PBF': { 
                name: 'Pacific Bluefin Tuna', 
                scientific: 'Thunnus orientalis',
                color: '#7c2d12',
                description: 'Pacific bluefin tuna, highly valuable'
            },
            'SKJ': { 
                name: 'Skipjack Tuna', 
                scientific: 'Katsuwonus pelamis',
                color: '#2563eb',
                description: 'Skipjack tuna, most abundant tuna species'
            },
            'TUN': { 
                name: 'Tuna (unspecified)', 
                scientific: 'Thunnus spp.',
                color: '#64748b',
                description: 'Unspecified tuna species'
            },
            'YFT': { 
                name: 'Yellowfin Tuna', 
                scientific: 'Thunnus albacares',
                color: '#d97706',
                description: 'Yellowfin tuna, major commercial species'
            }
        },
        
        // Priority order for display
        displayOrder: ['YFT', 'SKJ', 'BET', 'ALB', 'PBF', 'BZX', 'FRZ', 'BKJ', 'TUN']
    },

    // ===== SET TYPE CONFIGURATION =====
    setTypes: {
        // Set type information
        info: {
            'DEL': { 
                name: 'Dolphin Associated', 
                code: 'DEL',
                description: 'Sets made on dolphins (dolphin-associated sets)',
                color: '#dc2626'
            },
            'NOA': { 
                name: 'No Association', 
                code: 'NOA',
                description: 'Sets made on unassociated tuna schools',
                color: '#2563eb'
            },
            'OBJ': { 
                name: 'Floating Object', 
                code: 'OBJ',
                description: 'Sets made on floating objects (FADs)',
                color: '#059669'
            },
            'UNA': { 
                name: 'Unassociated', 
                code: 'UNA',
                description: 'Sets on unassociated fish schools',
                color: '#d97706'
            }
        }
    },

    // ===== TEMPORAL CONFIGURATION =====
    temporal: {
        // Month names and seasonal groupings
        months: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        
        // Seasonal definitions
        seasons: {
            'Winter': [12, 1, 2],
            'Spring': [3, 4, 5],
            'Summer': [6, 7, 8],
            'Fall': [9, 10, 11]
        },
        
        // Temporal analysis options
        groupings: ['month', 'year', 'season'],
        metrics: ['total_catch', 'num_sets', 'cpue']
    },

    // ===== STATISTICS CONFIGURATION =====
    statistics: {
        // Display format for numbers
        numberFormat: {
            locale: 'en-US',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        },
        
        // Units and labels
        units: {
            catch: 'tonnes',
            sets: 'fishing sets',
            cpue: 'tonnes/set',
            cells: '1°×1° areas'
        },
        
        // Thresholds for highlighting
        thresholds: {
            highCatch: 100,    // tonnes
            mediumCatch: 20,   // tonnes
            highSets: 10,      // number of sets
            highCPUE: 15       // tonnes per set
        }
    },

    // ===== EXPORT CONFIGURATION =====
    export: {
        // CSV export settings
        csv: {
            delimiter: ',',
            includeHeaders: true,
            filename: 'purse_seine_data',
            dateFormat: 'YYYY-MM-DD'
        },
        
        // JSON export settings
        json: {
            pretty: true,
            filename: 'purse_seine_export',
            includeMetadata: true
        },
        
        // Map export settings
        map: {
            format: 'png',
            filename: 'purse_seine_map',
            resolution: 300 // DPI
        }
    },

    // ===== PERFORMANCE CONFIGURATION =====
    performance: {
        // Debounce timing for search (milliseconds)
        searchDebounce: 300,
        
        // Map update throttling (milliseconds)
        mapUpdateThrottle: 200,
        
        // Chart update throttling (milliseconds)
        chartUpdateThrottle: 150,
        
        // Data chunking for large datasets
        chunking: {
            enabled: true,
            chunkSize: 2000
        },
        
        // Lazy loading settings
        lazyLoading: {
            enabled: true,
            threshold: 0.1
        }
    },

    // ===== ACCESSIBILITY CONFIGURATION =====
    accessibility: {
        // Screen reader settings
        announceUpdates: true,
        focusManagement: true,
        
        // Color contrast settings
        highContrast: false,
        
        // Reduced motion support
        respectReducedMotion: true,
        
        // Keyboard navigation
        keyboardShortcuts: {
            'alt+1': 'Switch to Interactive Map tab',
            'alt+2': 'Switch to Statistics tab',
            'alt+3': 'Switch to Temporal Analysis tab',
            'alt+4': 'Switch to Data Details tab',
            'ctrl+r': 'Reset all filters',
            'ctrl+f': 'Focus search box',
            'ctrl+e': 'Export filtered data',
            'ctrl+m': 'Export map as image',
            'ctrl+h': 'Show help',
            'ctrl+s': 'Save current state'
        }
    },

    // ===== LOCALIZATION CONFIGURATION =====
    localization: {
        // Default language
        defaultLanguage: 'en',
        
        // Available languages (for future implementation)
        availableLanguages: ['en', 'es'],
        
        // Date/time formatting
        dateFormat: 'MM/DD/YYYY',
        coordinateFormat: 'decimal', // 'decimal' or 'dms'
        
        // Regional settings
        region: 'eastern_pacific'
    },

    // ===== DEVELOPMENT CONFIGURATION =====
    development: {
        // Debug mode
        debug: false,
        
        // Console logging
        enableLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        
        // Performance monitoring
        performanceMonitoring: false,
        
        // Mock data for testing
        useMockData: false
    },

    // ===== EXTERNAL SERVICES =====
    external: {
        // CDN URLs for external libraries
        cdnUrls: {
            openlayers: 'https://unpkg.com/ol@6.5.0/ol.js',
            openlayersCss: 'https://unpkg.com/ol@6.5.0/ol.css',
            chartjs: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
            fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        },
        
        // Data sources
        dataSources: {
            iattc: {
                name: 'Inter-American Tropical Tuna Commission',
                url: 'https://www.iattc.org/',
                dataPolicy: 'Public Domain',
                description: 'Eastern Pacific Ocean purse-seine fishery data'
            }
        }
    },

    // ===== METADATA =====
    metadata: {
        version: '1.0.0',
        author: 'IATTC Purse Seine Geo Explorer Team',
        license: 'MIT',
        repository: 'https://github.com/yourusername/purse-seine-geo-explorer',
        lastUpdated: '2024-06-01',
        
        // SEO metadata
        seo: {
            description: 'Interactive mapping application for IATTC purse seine tuna catch data in the Eastern Pacific Ocean',
            keywords: ['tuna', 'purse seine', 'fisheries', 'IATTC', 'EPO', 'mapping', 'GIS', 'conservation'],
            author: 'Marine Conservation Team'
        },
        
        // Geographic coverage
        coverage: {
            spatial: 'Eastern Pacific Ocean (150°W-70°W, 30°S-40°N)',
            temporal: '2013-2023',
            resolution: '1° × 1° grid cells',
            frequency: 'Monthly'
        }
    }
};

// ===== CONFIGURATION UTILITIES =====

/**
 * Get configuration value with fallback
 * @param {string} path - Dot-notation path to config value
 * @param {*} fallback - Fallback value if not found
 * @returns {*} Configuration value
 */
function getConfig(path, fallback = null) {
    const keys = path.split('.');
    let value = PURSE_SEINE_CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }
    
    return value;
}

/**
 * Update configuration value
 * @param {string} path - Dot-notation path to config value
 * @param {*} value - New value to set
 */
function setConfig(path, value) {
    const keys = path.split('.');
    let current = PURSE_SEINE_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
}

/**
 * Get species information
 * @param {string} code - Species code
 * @returns {object} Species information
 */
function getSpeciesConfig(code) {
    return getConfig(`species.info.${code}`, { 
        name: code, 
        color: '#64748b',
        description: 'Unknown species'
    });
}

/**
 * Get set type information
 * @param {string} code - Set type code
 * @returns {object} Set type information
 */
function getSetTypeConfig(code) {
    return getConfig(`setTypes.info.${code}`, { 
        name: code, 
        description: 'Unknown set type',
        color: '#64748b'
    });
}

/**
 * Get color scale for metric
 * @param {string} metric - Metric name
 * @returns {object} Color scale configuration
 */
function getColorScale(metric) {
    return getConfig(`map.colorScales.${metric}`, getConfig('map.colorScales.total_catch'));
}

/**
 * Validate configuration
 * @returns {object} Validation result
 */
function validateConfig() {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // Check required paths
    const requiredPaths = [
        'data.filepath',
        'ui.title',
        'map.center',
        'map.bounds',
        'species.info',
        'setTypes.info'
    ];

    requiredPaths.forEach(path => {
        if (getConfig(path) === null) {
            validation.errors.push(`Missing required configuration: ${path}`);
            validation.isValid = false;
        }
    });

    // Check map bounds
    const bounds = getConfig('map.bounds');
    if (bounds && (bounds.north <= bounds.south || bounds.east <= bounds.west)) {
        validation.errors.push('Invalid map bounds: north/south or east/west values are incorrect');
        validation.isValid = false;
    }

    // Check color scales
    const colorScales = getConfig('map.colorScales', {});
    Object.keys(colorScales).forEach(scale => {
        const scaleConfig = colorScales[scale];
        if (!scaleConfig.thresholds || !scaleConfig.colors || 
            scaleConfig.thresholds.length !== scaleConfig.colors.length) {
            validation.warnings.push(`Color scale '${scale}' has mismatched thresholds and colors`);
        }
    });

    return validation;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        PURSE_SEINE_CONFIG, 
        getConfig, 
        setConfig, 
        getSpeciesConfig,
        getSetTypeConfig,
        getColorScale,
        validateConfig 
    };
}