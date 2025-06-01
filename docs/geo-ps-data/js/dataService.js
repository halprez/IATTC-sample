/**
 * DataService for Purse Seine Geo Explorer
 * Handles loading and processing of IATTC purse seine set-type data
 */
class DataService {
    constructor() {
        this.rawData = [];
        this.filteredData = [];
        this.gridCells = new Map(); // For spatial aggregation
        
        // Load configuration
        this.config = window.PURSE_SEINE_CONFIG || {};
        
        // Species information from config
        this.speciesInfo = getConfig('species.info', {
            'ALB': { name: 'Albacore', color: '#8b5cf6' },
            'BET': { name: 'Bigeye Tuna', color: '#dc2626' },
            'BKJ': { name: 'Black Skipjack', color: '#374151' },
            'BZX': { name: 'Mixed Bycatch', color: '#6b7280' },
            'FRZ': { name: 'Frigate Tuna', color: '#059669' },
            'PBF': { name: 'Pacific Bluefin Tuna', color: '#7c2d12' },
            'SKJ': { name: 'Skipjack Tuna', color: '#2563eb' },
            'TUN': { name: 'Tuna (unspecified)', color: '#64748b' },
            'YFT': { name: 'Yellowfin Tuna', color: '#d97706' }
        });
        
        // Set type information from config
        this.setTypeInfo = getConfig('setTypes.info', {
            'DEL': { name: 'Dolphin Associated', description: 'Sets made on dolphins' },
            'NOA': { name: 'No Association', description: 'Sets made on unassociated schools' },
            'OBJ': { name: 'Floating Object', description: 'Sets made on floating objects' },
            'UNA': { name: 'Unassociated', description: 'Sets on unassociated fish schools' }
        });
        
        // Month names from config
        this.monthNames = getConfig('temporal.months', [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]);
        
        this.metadata = {
            years: new Set(),
            months: new Set(),
            setTypes: new Set(),
            species: new Set(),
            latRange: { min: 90, max: -90 },
            lonRange: { min: 180, max: -180 }
        };
    }
    
    /**
     * Load data from JSON file
     */
    async loadData(filepath = null) {
        const dataPath = filepath || getConfig('data.filepath', 'data/PublicPSTunaSetType2013-2023.json');
        
        try {
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.rawData = await response.json();
            this._processMetadata();
            this._calculateTotalCatch();
            this.filteredData = [...this.rawData];
            this._updateGridCells();
            
            console.log(`Loaded ${this.rawData.length} purse seine records`);
            return this.rawData;
        } catch (error) {
            console.error('Error loading data:', error);
            return this._loadSampleData();
        }
    }
    
    /**
     * Load sample data as fallback
     */
    _loadSampleData() {
        console.warn('Using sample data - main dataset not found');
        // Sample data would go here - using the provided sample
        this.rawData = [];
        this.filteredData = [];
        return this.rawData;
    }
    
    /**
     * Process metadata from raw data
     */
    _processMetadata() {
        this.metadata = {
            years: new Set(),
            months: new Set(),
            setTypes: new Set(),
            species: new Set(),
            latRange: { min: 90, max: -90 },
            lonRange: { min: 180, max: -180 }
        };
        
        this.rawData.forEach(record => {
            this.metadata.years.add(record.Year);
            this.metadata.months.add(record.Month);
            this.metadata.setTypes.add(record.SetType);
            
            // Track coordinate ranges
            this.metadata.latRange.min = Math.min(this.metadata.latRange.min, record.LatC1);
            this.metadata.latRange.max = Math.max(this.metadata.latRange.max, record.LatC1);
            this.metadata.lonRange.min = Math.min(this.metadata.lonRange.min, record.LonC1);
            this.metadata.lonRange.max = Math.max(this.metadata.lonRange.max, record.LonC1);
            
            // Add species that have catches
            Object.keys(this.speciesInfo).forEach(species => {
                if (record[species] && record[species] > 0) {
                    this.metadata.species.add(species);
                }
            });
        });
    }
    
    /**
     * Calculate total catch for each record
     */
    _calculateTotalCatch() {
        this.rawData.forEach(record => {
            record.total_catch = Object.keys(this.speciesInfo).reduce((sum, species) => {
                return sum + (record[species] || 0);
            }, 0);
            
            // Calculate CPUE (Catch Per Unit Effort)
            record.cpue = record.NumSets > 0 ? record.total_catch / record.NumSets : 0;
        });
    }
    
    /**
     * Apply filters to data
     */
    applyFilters(filters) {
        this.filteredData = this.rawData.filter(record => {
            // Year filter
            if (filters.year && record.Year.toString() !== filters.year) {
                return false;
            }
            
            // Month filter
            if (filters.month && record.Month.toString() !== filters.month) {
                return false;
            }
            
            // Set type filter
            if (filters.setType && record.SetType !== filters.setType) {
                return false;
            }
            
            // Species filter (check if the species has significant catch)
            if (filters.species && record[filters.species] < 1) {
                return false;
            }
            
            return true;
        });
        
        this._updateGridCells();
        return this.filteredData;
    }
    
    /**
     * Update grid cells for spatial visualization
     */
    _updateGridCells() {
        this.gridCells.clear();
        
        this.filteredData.forEach(record => {
            const cellKey = `${record.LatC1},${record.LonC1}`;
            
            if (!this.gridCells.has(cellKey)) {
                this.gridCells.set(cellKey, {
                    lat: record.LatC1,
                    lon: record.LonC1,
                    records: [],
                    totalCatch: 0,
                    totalSets: 0,
                    speciesCatch: {},
                    setTypes: new Set(),
                    years: new Set(),
                    months: new Set()
                });
            }
            
            const cell = this.gridCells.get(cellKey);
            cell.records.push(record);
            cell.totalCatch += record.total_catch;
            cell.totalSets += record.NumSets;
            cell.setTypes.add(record.SetType);
            cell.years.add(record.Year);
            cell.months.add(record.Month);
            
            // Aggregate species catch
            Object.keys(this.speciesInfo).forEach(species => {
                if (!cell.speciesCatch[species]) {
                    cell.speciesCatch[species] = 0;
                }
                cell.speciesCatch[species] += record[species] || 0;
            });
        });
        
        // Calculate CPUE for each cell
        this.gridCells.forEach(cell => {
            cell.cpue = cell.totalSets > 0 ? cell.totalCatch / cell.totalSets : 0;
        });
    }
    
    /**
     * Get statistics for current filtered data
     */
    getStatistics() {
        const stats = {
            totalCatch: 0,
            totalSets: 0,
            activeCells: this.gridCells.size,
            avgCPUE: 0,
            speciesBreakdown: {},
            setTypeBreakdown: {},
            temporalRange: {
                years: Array.from(new Set(this.filteredData.map(r => r.Year))).sort(),
                months: Array.from(new Set(this.filteredData.map(r => r.Month))).sort()
            }
        };
        
        this.filteredData.forEach(record => {
            stats.totalCatch += record.total_catch;
            stats.totalSets += record.NumSets;
            
            // Species breakdown
            Object.keys(this.speciesInfo).forEach(species => {
                if (!stats.speciesBreakdown[species]) {
                    stats.speciesBreakdown[species] = 0;
                }
                stats.speciesBreakdown[species] += record[species] || 0;
            });
            
            // Set type breakdown
            if (!stats.setTypeBreakdown[record.SetType]) {
                stats.setTypeBreakdown[record.SetType] = {
                    catch: 0,
                    sets: 0
                };
            }
            stats.setTypeBreakdown[record.SetType].catch += record.total_catch;
            stats.setTypeBreakdown[record.SetType].sets += record.NumSets;
        });
        
        stats.avgCPUE = stats.totalSets > 0 ? stats.totalCatch / stats.totalSets : 0;
        
        return stats;
    }
    
    /**
     * Get aggregated data for charts
     */
    getChartData(type) {
        const stats = this.getStatistics();
        
        switch (type) {
            case 'species':
                return Object.entries(stats.speciesBreakdown)
                    .filter(([species, catch_val]) => catch_val > 0)
                    .map(([species, catch_val]) => ({
                        label: this.speciesInfo[species].name,
                        value: catch_val,
                        color: this.speciesInfo[species].color
                    }))
                    .sort((a, b) => b.value - a.value);
                    
            case 'setType':
                return Object.entries(stats.setTypeBreakdown)
                    .map(([setType, data]) => ({
                        label: this.setTypeInfo[setType]?.name || setType,
                        value: data.catch,
                        sets: data.sets
                    }))
                    .sort((a, b) => b.value - a.value);
                    
            case 'monthly':
                const monthlyData = Array.from({length: 12}, (_, i) => ({
                    month: i + 1,
                    label: this.monthNames[i],
                    catch: 0,
                    sets: 0
                }));
                
                this.filteredData.forEach(record => {
                    const monthIndex = record.Month - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        monthlyData[monthIndex].catch += record.total_catch;
                        monthlyData[monthIndex].sets += record.NumSets;
                    }
                });
                
                return monthlyData;
                
            case 'temporal':
                const temporalData = {};
                this.filteredData.forEach(record => {
                    const key = `${record.Year}-${record.Month.toString().padStart(2, '0')}`;
                    if (!temporalData[key]) {
                        temporalData[key] = {
                            year: record.Year,
                            month: record.Month,
                            catch: 0,
                            sets: 0
                        };
                    }
                    temporalData[key].catch += record.total_catch;
                    temporalData[key].sets += record.NumSets;
                });
                
                return Object.entries(temporalData)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, data]) => ({
                        ...data,
                        date: key,
                        cpue: data.sets > 0 ? data.catch / data.sets : 0
                    }));
                    
            default:
                return [];
        }
    }
    
    /**
     * Get spatial distribution data for maps
     */
    getSpatialData(metric = 'total_catch') {
        const spatialData = [];
        
        this.gridCells.forEach(cell => {
            let value = 0;
            
            switch (metric) {
                case 'total_catch':
                    value = cell.totalCatch;
                    break;
                case 'num_sets':
                    value = cell.totalSets;
                    break;
                case 'cpue':
                    value = cell.cpue;
                    break;
                case 'yft_catch':
                    value = cell.speciesCatch['YFT'] || 0;
                    break;
                case 'skj_catch':
                    value = cell.speciesCatch['SKJ'] || 0;
                    break;
                default:
                    value = cell.totalCatch;
            }
            
            if (value > 0) {
                spatialData.push({
                    lat: cell.lat,
                    lon: cell.lon,
                    value: value,
                    cell: cell
                });
            }
        });
        
        return spatialData;
    }
    
    /**
     * Get cell information by coordinates
     */
    getCellInfo(lat, lon) {
        const cellKey = `${lat},${lon}`;
        return this.gridCells.get(cellKey) || null;
    }
    
    /**
     * Search data
     */
    searchData(query) {
        if (!query || query.trim() === '') {
            return this.filteredData;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.filteredData.filter(record => {
            return (
                record.Year.toString().includes(searchTerm) ||
                record.Month.toString().includes(searchTerm) ||
                record.LatC1.toString().includes(searchTerm) ||
                record.LonC1.toString().includes(searchTerm) ||
                record.SetType.toLowerCase().includes(searchTerm) ||
                this.setTypeInfo[record.SetType]?.name.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    /**
     * Get metadata for UI components
     */
    getMetadata() {
        return {
            years: Array.from(this.metadata.years).sort(),
            months: Array.from(this.metadata.months).sort(),
            setTypes: Array.from(this.metadata.setTypes).sort(),
            species: Array.from(this.metadata.species).sort(),
            bounds: {
                north: this.metadata.latRange.max,
                south: this.metadata.latRange.min,
                east: this.metadata.lonRange.max,
                west: this.metadata.lonRange.min
            }
        };
    }
    
    /**
     * Export data as CSV
     */
    exportToCSV() {
        const headers = [
            'Year', 'Month', 'Latitude', 'Longitude', 'SetType', 'NumSets', 'TotalCatch', 'CPUE',
            ...Object.keys(this.speciesInfo)
        ];
        
        const csvData = [headers];
        
        this.filteredData.forEach(record => {
            const row = [
                record.Year,
                record.Month,
                record.LatC1,
                record.LonC1,
                record.SetType,
                record.NumSets,
                record.total_catch.toFixed(2),
                record.cpue.toFixed(3),
                ...Object.keys(this.speciesInfo).map(species => record[species] || 0)
            ];
            csvData.push(row);
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
     * Get grid cells
     */
    getGridCells() {
        return this.gridCells;
    }
    
    /**
     * Reset filters
     */
    resetFilters() {
        this.filteredData = [...this.rawData];
        this._updateGridCells();
        return this.filteredData;
    }
    
    /**
     * Get species information
     */
    getSpeciesInfo(code) {
        return this.speciesInfo[code] || { name: code, color: '#64748b' };
    }
    
    /**
     * Get set type information
     */
    getSetTypeInfo(code) {
        return this.setTypeInfo[code] || { name: code, description: 'Unknown set type' };
    }
    
    /**
     * Get month name
     */
    getMonthName(monthNum) {
        return this.monthNames[monthNum - 1] || `Month ${monthNum}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
}