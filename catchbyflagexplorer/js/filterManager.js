/**
 * FilterManager - Single Responsibility: Handle all filtering operations
 * Dependency Inversion: Depends on abstractions (dataService) not concretions
 */
class FilterManager {
    constructor(dataService) {
        this.dataService = dataService;
        this.currentFilters = {
            years: [],
            flags: [],
            gears: [],
            species: []
        };
        this.filterElements = {};
        this.observers = [];
    }
    
    /**
     * Initialize filter UI components
     */
    initializeFilters() {
        this.filterElements = {
            year: document.getElementById('yearFilter'),
            flag: document.getElementById('flagFilter'),
            gear: document.getElementById('gearFilter'),
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
        
        // Flag filter
        metadata.flags.forEach(flag => {
            const option = document.createElement('option');
            option.value = flag;
            option.textContent = this.dataService.getDisplayName('flag', flag);
            this.filterElements.flag.appendChild(option);
        });
        
        // Gear filter
        metadata.gears.forEach(gear => {
            const option = document.createElement('option');
            option.value = gear;
            option.textContent = this.dataService.getDisplayName('gear', gear);
            this.filterElements.gear.appendChild(option);
        });
        
        // Species filter
        metadata.species.forEach(species => {
            const option = document.createElement('option');
            option.value = species;
            option.textContent = this.dataService.getDisplayName('species', species);
            this.filterElements.species.appendChild(option);
        });
    }
    
    /**
     * Attach event listeners to filter controls
     */
    attachEventListeners() {
        // Filter change events
        this.filterElements.year.addEventListener('change', () => this.onFilterChange());
        this.filterElements.flag.addEventListener('change', () => this.onFilterChange());
        this.filterElements.gear.addEventListener('change', () => this.onFilterChange());
        this.filterElements.species.addEventListener('change', () => this.onFilterChange());
        
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
            years: Array.from(this.filterElements.year.selectedOptions).map(option => option.value),
            flags: Array.from(this.filterElements.flag.selectedOptions).map(option => option.value),
            gears: Array.from(this.filterElements.gear.selectedOptions).map(option => option.value),
            species: Array.from(this.filterElements.species.selectedOptions).map(option => option.value)
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
                Array.from(element.options).forEach(option => {
                    option.selected = false;
                });
            }
        });
        
        // Reset internal state
        this.currentFilters = {
            years: [],
            flags: [],
            gears: [],
            species: []
        };
        
        // Apply reset filters
        this.dataService.resetFilters();
        this.notifyObservers();
    }
    
    /**
     * Set specific filter values
     * @param {string} filterType - Type of filter (years, flags, gears, species)
     * @param {Array} values - Values to set
     */
    setFilter(filterType, values) {
        if (!this.currentFilters.hasOwnProperty(filterType)) {
            console.warn(`Unknown filter type: ${filterType}`);
            return;
        }
        
        const elementMap = {
            years: 'year',
            flags: 'flag',
            gears: 'gear',
            species: 'species'
        };
        
        const element = this.filterElements[elementMap[filterType]];
        if (!element) return;
        
        // Clear current selections
        Array.from(element.options).forEach(option => {
            option.selected = values.includes(option.value);
        });
        
        this.onFilterChange();
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
        return Object.values(this.currentFilters).some(filter => filter.length > 0);
    }
    
    /**
     * Get filter summary for display
     */
    getFilterSummary() {
        const summary = [];
        
        if (this.currentFilters.years.length > 0) {
            summary.push(`Years: ${this.currentFilters.years.join(', ')}`);
        }
        
        if (this.currentFilters.flags.length > 0) {
            const flagNames = this.currentFilters.flags.map(flag => 
                this.dataService.getDisplayName('flag', flag)
            );
            summary.push(`Flags: ${flagNames.join(', ')}`);
        }
        
        if (this.currentFilters.gears.length > 0) {
            const gearNames = this.currentFilters.gears.map(gear => 
                this.dataService.getDisplayName('gear', gear)
            );
            summary.push(`Gears: ${gearNames.join(', ')}`);
        }
        
        if (this.currentFilters.species.length > 0) {
            const speciesNames = this.currentFilters.species.map(species => 
                this.dataService.getDisplayName('species', species)
            );
            summary.push(`Species: ${speciesNames.join(', ')}`);
        }
        
        return summary.length > 0 ? summary.join(' | ') : 'No filters applied';
    }
    
    /**
     * Export current filter settings
     */
    exportFilters() {
        return {
            filters: this.getCurrentFilters(),
            timestamp: new Date().toISOString(),
            summary: this.getFilterSummary()
        };
    }
    
    /**
     * Import filter settings
     * @param {Object} filterConfig - Filter configuration to import
     */
    importFilters(filterConfig) {
        if (!filterConfig || !filterConfig.filters) {
            console.warn('Invalid filter configuration');
            return;
        }
        
        // Set each filter type
        Object.entries(filterConfig.filters).forEach(([filterType, values]) => {
            if (Array.isArray(values)) {
                this.setFilter(filterType, values);
            }
        });
    }
    
    /**
     * Add observer for filter changes
     * @param {Function} callback - Callback function to execute on filter change
     */
    addObserver(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    }
    
    /**
     * Remove observer
     * @param {Function} callback - Callback function to remove
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
            filteredData: this.dataService.getData()
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
     * Get suggested filters based on current data
     */
    getSuggestedFilters() {
        const data = this.dataService.getData();
        const suggestions = {
            topSpecies: this.dataService.getAggregatedData('species', 5),
            topFlags: this.dataService.getAggregatedData('flag', 5),
            recentYears: this.dataService.getMetadata().years.slice(-3)
        };
        
        return suggestions;
    }
    
    /**
     * Apply quick filter presets
     * @param {string} preset - Preset name
     */
    applyPreset(preset) {
        const presets = {
            'recent': {
                years: this.dataService.getMetadata().years.slice(-3)
            },
            'major-species': {
                species: this.dataService.getAggregatedData('species', 3).map(item => item.label)
            },
            'purse-seine': {
                gears: ['PS']
            },
            'longline': {
                gears: ['LL']
            },
            'usa-mexico': {
                flags: ['USA', 'MEX']
            }
        };
        
        if (presets[preset]) {
            // Reset first
            this.resetFilters();
            
            // Apply preset
            Object.entries(presets[preset]).forEach(([filterType, values]) => {
                this.setFilter(filterType, values);
            });
        }
    }
}