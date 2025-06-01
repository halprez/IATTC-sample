/**
 * DataService - Single Responsibility: Handle all data operations
 * Follows Open/Closed principle: Open for extension, closed for modification
 */
class DataService {
    constructor() {
        this.rawData = [];
        this.filteredData = [];
        this.metadata = {
            years: new Set(),
            flags: new Set(),
            gears: new Set(),
            species: new Set()
        };
        
        // Species code mappings for better display
        this.speciesMappings = {
            'ALB': 'Albacore',
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
            'SKH': 'Shortfin Mako',
            'SKJ': 'Skipjack Tuna',
            'SRX': 'Swordfish',
            'SSP': 'Silky Shark',
            'SWO': 'Swordfish',
            'TUN': 'Tuna (unspecified)',
            'YFT': 'Yellowfin Tuna'
        };
        
        // Gear type mappings
        this.gearMappings = {
            'PS': 'Purse Seine',
            'LL': 'Longline',
            'HAR': 'Harpoon',
            'UNK': 'Unknown',
            'GN': 'Gillnet',
            'LTL': 'Lateral Longline',
            'OTR': 'Other',
            'RG': 'Rod and Reel'
        };
        
        // Flag mappings
        this.flagMappings = {
            'MEX': 'Mexico',
            'NIC': 'Nicaragua',
            'OTR': 'Other',
            'PAN': 'Panama',
            'PER': 'Peru',
            'TWN': 'Taiwan',
            'USA': 'United States',
            'VEN': 'Venezuela',
            'VUT': 'Vanuatu'
        };
    }
    
    /**
     * Load data from JSON file
     * @param {string} filepath - Path to the JSON file
     */
    async loadData(filepath = 'data/CatchByFlagGear2013-2023.json') {
        try {
            const response = await fetch(filepath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.rawData = await response.json();
            this._processMetadata();
            this.filteredData = [...this.rawData];
            
            return this.rawData;
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to sample data if main file not found
            return this._loadSampleData();
        }
    }
    
    /**
     * Fallback method to use sample data
     */
    _loadSampleData() {
        // This would contain the sample data structure
        // For now, we'll assume the data loads successfully
        console.warn('Using sample data - main dataset not found');
        this.rawData = [];
        this.filteredData = [];
        return this.rawData;
    }
    
    /**
     * Extract metadata from raw data
     * @private
     */
    _processMetadata() {
        this.metadata = {
            years: new Set(),
            flags: new Set(),
            gears: new Set(),
            species: new Set()
        };
        
        this.rawData.forEach(record => {
            this.metadata.years.add(record.AnoYear);
            this.metadata.flags.add(record.BanderaFlag);
            this.metadata.gears.add(record.ArteGear);
            this.metadata.species.add(record.EspeciesSpecies);
        });
    }
    
    /**
     * Apply filters to data
     * @param {Object} filters - Filter criteria
     */
    applyFilters(filters) {
        this.filteredData = this.rawData.filter(record => {
            // Year filter
            if (filters.years && filters.years.length > 0) {
                if (!filters.years.includes(record.AnoYear.toString())) {
                    return false;
                }
            }
            
            // Flag filter
            if (filters.flags && filters.flags.length > 0) {
                if (!filters.flags.includes(record.BanderaFlag)) {
                    return false;
                }
            }
            
            // Gear filter
            if (filters.gears && filters.gears.length > 0) {
                if (!filters.gears.includes(record.ArteGear)) {
                    return false;
                }
            }
            
            // Species filter
            if (filters.species && filters.species.length > 0) {
                if (!filters.species.includes(record.EspeciesSpecies)) {
                    return false;
                }
            }
            
            return true;
        });
        
        return this.filteredData;
    }
    
    /**
     * Get aggregated statistics
     */
    getStatistics() {
        const data = this.filteredData;
        
        return {
            totalCatch: data.reduce((sum, record) => sum + record.t, 0),
            totalRecords: data.length,
            uniqueFlags: new Set(data.map(r => r.BanderaFlag)).size,
            uniqueGears: new Set(data.map(r => r.ArteGear)).size,
            uniqueSpecies: new Set(data.map(r => r.EspeciesSpecies)).size,
            yearRange: {
                min: Math.min(...data.map(r => r.AnoYear)),
                max: Math.max(...data.map(r => r.AnoYear))
            }
        };
    }
    
    /**
     * Get aggregated data by specified field
     * @param {string} field - Field to aggregate by
     * @param {number} limit - Limit results
     */
    getAggregatedData(field, limit = null) {
        const fieldMap = {
            'flag': 'BanderaFlag',
            'gear': 'ArteGear',
            'species': 'EspeciesSpecies',
            'year': 'AnoYear'
        };
        
        const dataField = fieldMap[field] || field;
        const aggregated = {};
        
        this.filteredData.forEach(record => {
            const key = record[dataField];
            if (!aggregated[key]) {
                aggregated[key] = 0;
            }
            aggregated[key] += record.t;
        });
        
        // Convert to array and sort
        let result = Object.entries(aggregated)
            .map(([key, value]) => ({ label: key, value }))
            .sort((a, b) => b.value - a.value);
            
        if (limit) {
            result = result.slice(0, limit);
        }
        
        return result;
    }
    
    /**
     * Get time series data
     * @param {string} groupBy - Field to group by (optional)
     */
    getTimeSeriesData(groupBy = null) {
        const yearlyData = {};
        
        // Initialize years
        const years = Array.from(this.metadata.years).sort();
        years.forEach(year => {
            yearlyData[year] = groupBy ? {} : 0;
        });
        
        this.filteredData.forEach(record => {
            const year = record.AnoYear;
            
            if (groupBy) {
                const groupKey = record[groupBy] || 'Unknown';
                if (!yearlyData[year][groupKey]) {
                    yearlyData[year][groupKey] = 0;
                }
                yearlyData[year][groupKey] += record.t;
            } else {
                yearlyData[year] += record.t;
            }
        });
        
        return yearlyData;
    }
    
    /**
     * Get comparative data for two entities
     * @param {string} field - Field to compare
     * @param {Array} entities - Entities to compare
     */
    getComparativeData(field, entities) {
        const fieldMap = {
            'flag': 'BanderaFlag',
            'gear': 'ArteGear',
            'species': 'EspeciesSpecies'
        };
        
        const dataField = fieldMap[field];
        const result = {};
        
        entities.forEach(entity => {
            const entityData = this.filteredData.filter(record => 
                record[dataField] === entity
            );
            
            result[entity] = {
                total: entityData.reduce((sum, record) => sum + record.t, 0),
                records: entityData.length,
                years: new Set(entityData.map(r => r.AnoYear)).size
            };
        });
        
        return result;
    }
    
    /**
     * Search data based on query
     * @param {string} query - Search query
     */
    searchData(query) {
        if (!query || query.trim() === '') {
            return this.filteredData;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.filteredData.filter(record => {
            return (
                record.AnoYear.toString().includes(searchTerm) ||
                record.BanderaFlag.toLowerCase().includes(searchTerm) ||
                record.ArteGear.toLowerCase().includes(searchTerm) ||
                record.EspeciesSpecies.toLowerCase().includes(searchTerm) ||
                this.getDisplayName('species', record.EspeciesSpecies).toLowerCase().includes(searchTerm) ||
                this.getDisplayName('gear', record.ArteGear).toLowerCase().includes(searchTerm) ||
                this.getDisplayName('flag', record.BanderaFlag).toLowerCase().includes(searchTerm)
            );
        });
    }
    
    /**
     * Get display name for codes
     * @param {string} type - Type of mapping (species, gear, flag)
     * @param {string} code - Code to map
     */
    getDisplayName(type, code) {
        const mappings = {
            'species': this.speciesMappings,
            'gear': this.gearMappings,
            'flag': this.flagMappings
        };
        
        return mappings[type]?.[code] || code;
    }
    
    /**
     * Get metadata for UI components
     */
    getMetadata() {
        return {
            years: Array.from(this.metadata.years).sort(),
            flags: Array.from(this.metadata.flags).sort(),
            gears: Array.from(this.metadata.gears).sort(),
            species: Array.from(this.metadata.species).sort()
        };
    }
    
    /**
     * Export filtered data as CSV
     */
    exportToCSV() {
        const headers = ['Year', 'Flag', 'Gear', 'Species', 'Catch (tonnes)'];
        const csvData = [headers];
        
        this.filteredData.forEach(record => {
            csvData.push([
                record.AnoYear,
                this.getDisplayName('flag', record.BanderaFlag),
                this.getDisplayName('gear', record.ArteGear),
                this.getDisplayName('species', record.EspeciesSpecies),
                record.t
            ]);
        });
        
        return csvData.map(row => row.join(',')).join('\n');
    }
    
    /**
     * Get current filtered data
     */
    getData() {
        return this.filteredData;
    }
    
    /**
     * Reset filters
     */
    resetFilters() {
        this.filteredData = [...this.rawData];
        return this.filteredData;
    }
}