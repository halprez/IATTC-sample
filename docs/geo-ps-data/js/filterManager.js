/**
 * FilterManager for Purse Seine Geo Explorer
 * Handles all filtering operations and UI interactions
 */
class FilterManager {
    constructor(dataService) {
        this.dataService = dataService;
        this.currentFilters = {
            year: '',
            month: '',
            setType: '',
            species: ''
        };
        this.observers = [];
        this.filterElements = {};
    }
    
    /**
     * Initialize filter UI components
     */
    initializeFilters() {
        this.filterElements = {
            year: document.getElementById('yearFilter'),
            month: document.getElementById('monthFilter'),
            setType: document.getElementById('setTypeFilter'),
            species: document.getElementById('speciesFilter'),
            reset: document.getElementById('resetFilters')
        };
        
        this.populateFilterOptions();
        this.attachEventListeners();
    }
    
    /**
     * Populate filter dropdowns with options
     */
    populateFilterOptions() {
        const metadata = this.dataService.getMetadata();
        
        // Year filter
        metadata.years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.filterElements.year.appendChild(option);
        });
        
        // Month filter
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = this.dataService.getMonthName(month);
            this.filterElements.month.appendChild(option);
        }
        
        // Species filter already has options in HTML
        
        // Set type filter already has options in HTML
    }
    
    /**
     * Attach event listeners to filter controls
     */
    attachEventListeners() {
        // Filter change events
        Object.keys(this.filterElements).forEach(filterType => {
            const element = this.filterElements[filterType];
            if (element && element.tagName === 'SELECT') {
                element.addEventListener('change', () => this.onFilterChange());
            }
        });
        
        // Reset button
        this.filterElements.reset.addEventListener('click', () => this.resetFilters());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.resetFilters();
                        break;
                }
            }
        });
    }
    
    /**
     * Handle filter changes
     */
    onFilterChange() {
        this.updateCurrentFilters();
        this.applyFilters();
        this.notifyObservers();
    }
    
    /**
     * Update current filter state from UI
     */
    updateCurrentFilters() {
        this.currentFilters = {
            year: this.filterElements.year.value,
            month: this.filterElements.month.value,
            setType: this.filterElements.setType.value,
            species: this.filterElements.species.value
        };
    }
    
    /**
     * Apply current filters to data
     */
    applyFilters() {
        return this.dataService.applyFilters(this.currentFilters);
    }
    
    /**
     * Reset all filters
     */
    resetFilters() {
        // Clear all selections
        Object.values(this.filterElements).forEach(element => {
            if (element && element.tagName === 'SELECT') {
                element.value = '';
            }
        });
        
        // Reset internal state
        this.currentFilters = {
            year: '',
            month: '',
            setType: '',
            species: ''
        };
        
        // Apply reset filters
        this.dataService.resetFilters();
        this.notifyObservers();
    }
    
    /**
     * Set specific filter values
     */
    setFilter(filterType, value) {
        if (!this.currentFilters.hasOwnProperty(filterType)) {
            console.warn(`Unknown filter type: ${filterType}`);
            return;
        }
        
        const element = this.filterElements[filterType];
        if (element) {
            element.value = value;
            this.onFilterChange();
        }
    }
    
    /**
     * Get current filter state
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }
    
    /**
     * Check if any filters are active
     */
    hasActiveFilters() {
        return Object.values(this.currentFilters).some(filter => filter !== '');
    }
    
    /**
     * Get filter summary for display
     */
    getFilterSummary() {
        const summary = [];
        
        if (this.currentFilters.year) {
            summary.push(`Year: ${this.currentFilters.year}`);
        }
        
        if (this.currentFilters.month) {
            const monthName = this.dataService.getMonthName(parseInt(this.currentFilters.month));
            summary.push(`Month: ${monthName}`);
        }
        
        if (this.currentFilters.setType) {
            const setTypeInfo = this.dataService.getSetTypeInfo(this.currentFilters.setType);
            summary.push(`Set Type: ${setTypeInfo.name}`);
        }
        
        if (this.currentFilters.species) {
            const speciesInfo = this.dataService.getSpeciesInfo(this.currentFilters.species);
            summary.push(`Primary Species: ${speciesInfo.name}`);
        }
        
        return summary.length > 0 ? summary.join(' | ') : 'No filters applied';
    }
    
    /**
     * Get filter suggestions based on current selection
     */
    getFilterSuggestions() {
        const currentData = this.dataService.getData();
        const suggestions = {
            recommendedYears: [],
            recommendedMonths: [],
            recommendedSetTypes: [],
            recommendedSpecies: []
        };
        
        // Analyze current data to suggest relevant filters
        if (currentData.length > 0) {
            // Most productive years
            const yearCatch = {};
            currentData.forEach(record => {
                if (!yearCatch[record.Year]) yearCatch[record.Year] = 0;
                yearCatch[record.Year] += record.total_catch;
            });
            suggestions.recommendedYears = Object.entries(yearCatch)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([year]) => parseInt(year));
            
            // Most productive months
            const monthCatch = {};
            currentData.forEach(record => {
                if (!monthCatch[record.Month]) monthCatch[record.Month] = 0;
                monthCatch[record.Month] += record.total_catch;
            });
            suggestions.recommendedMonths = Object.entries(monthCatch)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([month]) => parseInt(month));
        }
        
        return suggestions;
    }
    
    /**
     * Apply quick filter presets
     */
    applyPreset(preset) {
        const presets = {
            'recent-high-activity': {
                year: '2023',
                month: '',
                setType: 'DEL',
                species: 'YFT'
            },
            'skipjack-focus': {
                year: '',
                month: '',
                setType: '',
                species: 'SKJ'
            },
            'dolphin-sets': {
                year: '',
                month: '',
                setType: 'DEL',
                species: ''
            },
            'peak-season': {
                year: '',
                month: '6', // June - often peak season
                setType: '',
                species: ''
            },
            'no-association': {
                year: '',
                month: '',
                setType: 'NOA',
                species: ''
            }
        };
        
        if (presets[preset]) {
            // Reset first
            this.resetFilters();
            
            // Apply preset
            Object.entries(presets[preset]).forEach(([filterType, value]) => {
                if (value) {
                    this.setFilter(filterType, value);
                }
            });
        }
    }
    
    /**
     * Export current filter settings
     */
    exportFilters() {
        return {
            filters: this.getCurrentFilters(),
            timestamp: new Date().toISOString(),
            summary: this.getFilterSummary(),
            dataCount: this.dataService.getData().length
        };
    }
    
    /**
     * Import filter settings
     */
    importFilters(filterConfig) {
        if (!filterConfig || !filterConfig.filters) {
            console.warn('Invalid filter configuration');
            return;
        }
        
        // Reset first
        this.resetFilters();
        
        // Set each filter
        Object.entries(filterConfig.filters).forEach(([filterType, value]) => {
            if (value) {
                this.setFilter(filterType, value);
            }
        });
    }
    
    /**
     * Add observer for filter changes
     */
    addObserver(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    }
    
    /**
     * Remove observer
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }
    
    /**
     * Notify all observers of filter changes
     */
    notifyObservers() {
        const filterData = {
            filters: this.getCurrentFilters(),
            hasActiveFilters: this.hasActiveFilters(),
            summary: this.getFilterSummary(),
            filteredData: this.dataService.getData(),
            suggestions: this.getFilterSuggestions()
        };
        
        this.observers.forEach(callback => {
            try {
                callback(filterData);
            } catch (error) {
                console.error('Error in filter observer:', error);
            }
        });
    }
    
    /**
     * Get temporal filter options based on current selection
     */
    getTemporalFilterOptions() {
        const currentData = this.dataService.getData();
        const years = [...new Set(currentData.map(r => r.Year))].sort();
        const months = [...new Set(currentData.map(r => r.Month))].sort();
        
        return {
            availableYears: years,
            availableMonths: months,
            currentYear: this.currentFilters.year,
            currentMonth: this.currentFilters.month
        };
    }
    
    /**
     * Get spatial filter bounds based on current selection
     */
    getSpatialFilterBounds() {
        const currentData = this.dataService.getData();
        
        if (currentData.length === 0) {
            return null;
        }
        
        const bounds = {
            north: Math.max(...currentData.map(r => r.LatC1)),
            south: Math.min(...currentData.map(r => r.LatC1)),
            east: Math.max(...currentData.map(r => r.LonC1)),
            west: Math.min(...currentData.map(r => r.LonC1))
        };
        
        return bounds;
    }
    
    /**
     * Update filter availability based on data
     */
    updateFilterAvailability() {
        const metadata = this.dataService.getMetadata();
        
        // Disable options that would result in no data
        // This could be enhanced to show/hide options dynamically
        console.log('Filter availability updated', metadata);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}