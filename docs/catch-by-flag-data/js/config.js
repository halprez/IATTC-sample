/**
 * IATTC Tuna Catch Data Explorer - Configuration File
 * 
 * Customize the application behavior by modifying the values below.
 */

const APP_CONFIG = {
    
    // ===== DATA CONFIGURATION =====
    data: {
        // Path to your main data file
        filepath: './data/CatchByFlagGear2013-2023.json',
        
        // Fallback sample data file (if main file fails to load)
        sampleFilepath: 'data/CatchByFlagGear2013-2023_sample.json',
        
        // Maximum file size warning (in MB)
        maxFileSizeMB: 10,
        
        // Data validation settings
        validation: {
            required_fields: ['AnoYear', 'BanderaFlag', 'ArteGear', 'EspeciesSpecies', 't'],
            min_year: 2000,
            max_year: new Date().getFullYear(),
            min_catch: 0
        }
    },

    // ===== UI CONFIGURATION =====
    ui: {
        // Application title and metadata
        title: '🐟 IATTC Tuna Catch Data Explorer',
        subtitle: 'Interactive analysis of tuna catches by flag and gear (2013-2023)',
        
        // Default active tab on load
        defaultTab: 'overview',
        
        // Enable/disable features
        features: {
            exportData: true,
            keyboardShortcuts: true,
            helpModal: true,
            darkModeDetection: true,
            animations: true,
            responsiveCharts: true
        },
        
        // Pagination settings
        pagination: {
            itemsPerPage: 50,
            showPagination: true
        },
        
        // Chart animation settings
        animations: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    },

    // ===== CHART CONFIGURATION =====
    charts: {
        // Default chart colors (will cycle through these)
        colorPalette: [
            '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
            '#db2777', '#0891b2', '#65a30d', '#dc2626', '#9333ea',
            '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'
        ],
        
        // Chart-specific settings
        species: {
            type: 'doughnut',
            maxItems: 10,
            showPercentages: true
        },
        
        flag: {
            type: 'bar',
            sortDescending: true,
            showAllFlags: true
        },
        
        trends: {
            type: 'line',
            fillArea: true,
            showPoints: true,
            smoothLines: true
        },
        
        gear: {
            type: 'pie',
            showLegend: true,
            legendPosition: 'bottom'
        },
        
        comparison: {
            type: 'horizontalBar',
            maxBars: 15
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
            flag: true,
            gear: true,
            species: true
        },
        
        // Filter presets for quick selection
        presets: {
            'recent-years': {
                name: 'Recent Years (2021-2023)',
                filters: {
                    years: ['2021', '2022', '2023']
                }
            },
            'major-species': {
                name: 'Major Species (YFT, SKJ, BET)',
                filters: {
                    species: ['YFT', 'SKJ', 'BET']
                }
            },
            'purse-seine': {
                name: 'Purse Seine Only',
                filters: {
                    gears: ['PS']
                }
            },
            'longline': {
                name: 'Longline Only',
                filters: {
                    gears: ['LL']
                }
            },
            'pacific-nations': {
                name: 'Major Pacific Nations',
                filters: {
                    flags: ['USA', 'MEX', 'PAN', 'TWN']
                }
            }
        },
        
        // Default selections (empty = all selected)
        defaults: {
            years: [],
            flags: [],
            gears: [],
            species: []
        }
    },

    // ===== DATA MAPPINGS =====
    mappings: {
        // Species code to full name mappings
        species: {
            'ALB': 'Albacore Tuna',
            'BET': 'Bigeye Tuna',
            'BIL': 'Billfish',
            'BKJ': 'Black Skipjack',
            'BLM': 'Blue Marlin',
            'BUM': 'Blue Marlin',
            'BXQ': 'Mixed Sharks',
            'BZX': 'Mixed Bycatch',
            'CGX': 'Common Dolphinfish',
            'DOX': 'Dolphinfish',
            'MLS': 'Striped Marlin',
            'MZZ': 'Mixed Marlin',
            'PBF': 'Pacific Bluefin Tuna',
            'SFA': 'Sailfish',
            'SKH': 'Shortfin Mako Shark',
            'SKJ': 'Skipjack Tuna',
            'SRX': 'Shark (unspecified)',
            'SSP': 'Silky Shark',
            'SWO': 'Swordfish',
            'TUN': 'Tuna (unspecified)',
            'YFT': 'Yellowfin Tuna'
        },

        // Gear type mappings
        gear: {
            'PS': 'Purse Seine',
            'LL': 'Longline',
            'HAR': 'Harpoon',
            'UNK': 'Unknown Gear',
            'GN': 'Gillnet',
            'LTL': 'Lateral Longline',
            'OTR': 'Other Gear',
            'RG': 'Rod and Reel'
        },

        // Flag state/country mappings
        flag: {
            'MEX': 'Mexico',
            'NIC': 'Nicaragua',
            'OTR': 'Other Nations',
            'PAN': 'Panama',
            'PER': 'Peru',
            'TWN': 'Taiwan',
            'USA': 'United States',
            'VEN': 'Venezuela',
            'VUT': 'Vanuatu'
        }
    },

    // ===== STATISTICS CONFIGURATION =====
    statistics: {
        // Display format for large numbers
        numberFormat: {
            locale: 'en-US',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        },
        
        // Units and labels
        units: {
            catch: 'tonnes',
            currency: 'USD',
            weight: 'metric tons'
        },
        
        // Thresholds for highlighting
        thresholds: {
            highCatch: 10000,  // tonnes
            mediumCatch: 1000  // tonnes
        }
    },

    // ===== EXPORT CONFIGURATION =====
    export: {
        // CSV export settings
        csv: {
            delimiter: ',',
            includeHeaders: true,
            filename: 'iattc_catch_data',
            dateFormat: 'YYYY-MM-DD'
        },
        
        // JSON export settings
        json: {
            pretty: true,
            filename: 'iattc_filtered_data'
        }
    },

    // ===== PERFORMANCE CONFIGURATION =====
    performance: {
        // Debounce timing for search (milliseconds)
        searchDebounce: 300,
        
        // Chart update throttling (milliseconds)
        chartUpdateThrottle: 200,
        
        // Lazy loading settings
        lazyLoading: {
            enabled: true,
            threshold: 0.1
        },
        
        // Data chunking for large datasets
        chunking: {
            enabled: true,
            chunkSize: 1000
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
            'alt+1': 'Switch to Overview tab',
            'alt+2': 'Switch to Trends tab',
            'alt+3': 'Switch to Comparison tab',
            'alt+4': 'Switch to Details tab',
            'ctrl+r': 'Reset all filters',
            'ctrl+f': 'Focus search box',
            'ctrl+e': 'Export data',
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
        timeFormat: '12h'
    },

    // ===== DEVELOPMENT CONFIGURATION =====
    development: {
        // Debug mode
        debug: false,
        
        // Console logging
        enableLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        
        // Performance monitoring
        performanceMonitoring: false
    },

    // ===== EXTERNAL SERVICES =====
    external: {
        // CDN URLs for external libraries
        cdnUrls: {
            chartjs: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
        },
        
        // Data sources
        dataSources: {
            iattc: {
                name: 'Inter-American Tropical Tuna Commission',
                url: 'https://www.iattc.org/',
                dataPolicy: 'Public Domain'
            }
        }
    },

    // ===== METADATA =====
    metadata: {
        version: '1.0.0',
        author: 'IATTC Data Explorer Team',
        license: 'MIT',
        repository: 'https://github.com/yourusername/iattc-tuna-explorer',
        lastUpdated: '2024-06-01',
        
        // SEO metadata
        seo: {
            description: 'Interactive web application for exploring IATTC tuna catch data from 2013-2023',
            keywords: ['tuna', 'fisheries', 'IATTC', 'conservation', 'data visualization', 'marine biology'],
            author: 'Marine Conservation Team'
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
    let value = APP_CONFIG;
    
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
    let current = APP_CONFIG;
    
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
        'charts.colorPalette',
        'mappings.species',
        'mappings.gear',
        'mappings.flag'
    ];

    requiredPaths.forEach(path => {
        if (getConfig(path) === null) {
            validation.errors.push(`Missing required configuration: ${path}`);
            validation.isValid = false;
        }
    });

    // Check color palette
    const colors = getConfig('charts.colorPalette', []);
    if (colors.length < 5) {
        validation.warnings.push('Color palette should have at least 5 colors for better chart variety');
    }

    // Check data file path
    const filepath = getConfig('data.filepath');
    if (filepath && !filepath.endsWith('.json')) {
        validation.warnings.push('Data filepath should point to a JSON file');
    }

    return validation;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_CONFIG, getConfig, setConfig, validateConfig };
}