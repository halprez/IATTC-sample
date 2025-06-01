/**
 * Main Application Class - Single Responsibility: Orchestrate the application
 * Dependency Inversion: Depends on abstractions, not concretions
 */
class App {
    constructor() {
        this.dataService = new DataService();
        this.chartRenderer = new ChartRenderer(this.dataService);
        this.filterManager = new FilterManager(this.dataService);
        this.tableManager = new TableManager(this.dataService);
        
        this.currentTab = 'overview';
        this.loadingOverlay = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load data
            await this.loadData();
            
            // Initialize all managers
            this.initializeManagers();
            
            // Setup observers
            this.setupObservers();
            
            // Initial render
            this.updateAll();
            
            this.isInitialized = true;
            this.hideLoading();
            
            console.log('IATTC Tuna Catch Explorer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to load application. Please refresh and try again.');
        }
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Initialize tab navigation
        this.initializeTabNavigation();
        
        // Initialize comparison controls
        this.initializeComparisonControls();
        
        // Add keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Add responsive handlers
        this.initializeResponsiveHandlers();
    }
    
    /**
     * Initialize tab navigation
     */
    initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }
    
    /**
     * Switch to a specific tab
     * @param {string} tabId - ID of the tab to switch to
     */
    switchTab(tabId) {
        // Update button states
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        this.currentTab = tabId;
        
        // Resize charts after tab switch
        setTimeout(() => {
            this.chartRenderer.resizeCharts();
        }, 100);
    }
    
    /**
     * Initialize comparison controls
     */
    initializeComparisonControls() {
        const compareBySelect = document.getElementById('compareBy');
        const metricBySelect = document.getElementById('metricBy');
        
        if (compareBySelect && metricBySelect) {
            const updateComparison = () => {
                this.chartRenderer.updateComparisonChart(
                    compareBySelect.value,
                    metricBySelect.value
                );
            };
            
            compareBySelect.addEventListener('change', updateComparison);
            metricBySelect.addEventListener('change', updateComparison);
        }
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation with numbers
            if (e.altKey && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const tabs = ['overview', 'trends', 'comparison', 'details'];
                const tabIndex = parseInt(e.key) - 1;
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }
            
            // Quick actions
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        this.showHelp();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCurrentState();
                        break;
                }
            }
        });
    }
    
    /**
     * Initialize responsive handlers
     */
    initializeResponsiveHandlers() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.chartRenderer.resizeCharts();
            }, 250);
        });
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.chartRenderer.resizeCharts();
            }, 500);
        });
    }
    
    /**
     * Load application data
     */
    async loadData() {
        try {
            await this.dataService.loadData();
        } catch (error) {
            console.error('Error loading data:', error);
            // Try to load sample data as fallback
            await this.loadSampleDataFallback();
        }
    }
    
    /**
     * Fallback to sample data if main dataset fails
     */
    async loadSampleDataFallback() {
        console.warn('Loading sample data as fallback');
        // This could load the sample data from the document
        // For now, we'll show a warning to the user
        this.showWarning('Main dataset unavailable. Please ensure CatchByFlagGear2013-2023.json is in the data/ folder.');
    }
    
    /**
     * Initialize all managers
     */
    initializeManagers() {
        this.filterManager.initializeFilters();
        this.tableManager.initializeTable();
        this.chartRenderer.initializeCharts();
    }
    
    /**
     * Setup observer patterns
     */
    setupObservers() {
        // Filter changes update charts and table
        this.filterManager.addObserver((filterData) => {
            this.updateStatistics();
            this.chartRenderer.updateCharts();
            this.tableManager.updateTable();
        });
    }
    
    /**
     * Update all components
     */
    updateAll() {
        this.updateStatistics();
        this.chartRenderer.updateCharts();
        this.tableManager.updateTable();
    }
    
    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = this.dataService.getStatistics();
        
        // Update stat cards
        this.updateStatCard('totalCatch', stats.totalCatch.toLocaleString());
        this.updateStatCard('totalFlags', stats.uniqueFlags);
        this.updateStatCard('totalGears', stats.uniqueGears);
        this.updateStatCard('totalSpecies', stats.uniqueSpecies);
    }
    
    /**
     * Update individual stat card
     * @param {string} id - Element ID
     * @param {string|number} value - Value to display
     */
    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            
            // Add animation effect
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    /**
     * Show loading overlay
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.hideLoading();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }
    
    /**
     * Show warning message
     * @param {string} message - Warning message
     */
    showWarning(message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning-message';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ Warning</h3>
                <p>${message}</p>
                <button onclick="this.parentNode.parentNode.remove()">Dismiss</button>
            </div>
        `;
        
        document.body.appendChild(warningDiv);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.remove();
            }
        }, 10000);
    }
    
    /**
     * Show help modal
     */
    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <h2>IATTC Tuna Catch Data Explorer - Help</h2>
                
                <h3>Navigation</h3>
                <ul>
                    <li><strong>Alt + 1-4:</strong> Switch between tabs</li>
                    <li><strong>Ctrl/Cmd + R:</strong> Reset all filters</li>
                    <li><strong>Ctrl/Cmd + F:</strong> Focus search in Details tab</li>
                    <li><strong>Ctrl/Cmd + E:</strong> Export data as CSV</li>
                    <li><strong>Ctrl/Cmd + H:</strong> Show this help</li>
                </ul>
                
                <h3>Features</h3>
                <ul>
                    <li><strong>Overview:</strong> Summary statistics and key charts</li>
                    <li><strong>Trends:</strong> Time series analysis</li>
                    <li><strong>Comparison:</strong> Compare different entities</li>
                    <li><strong>Details:</strong> Searchable data table</li>
                </ul>
                
                <h3>Filtering</h3>
                <p>Use the filter controls at the top to narrow down the data. All charts and tables will update automatically.</p>
                
                <h3>Data Source</h3>
                <p>Data from the Inter-American Tropical Tuna Commission (IATTC) - Public Domain</p>
                
                <button class="close-help">Close</button>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Close button handler
        helpModal.querySelector('.close-help').addEventListener('click', () => {
            helpModal.remove();
        });
        
        // Close on outside click
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
    }
    
    /**
     * Save current application state
     */
    saveCurrentState() {
        const state = {
            filters: this.filterManager.getCurrentFilters(),
            currentTab: this.currentTab,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(state, null, 2)], { 
            type: 'application/json' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `iattc_explorer_state_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    /**
     * Handle application errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Application error:', error);
        
        // Show user-friendly error message
        this.showError('An unexpected error occurred. Please refresh the page and try again.');
        
        // In production, you might want to send this to an error tracking service
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentTab: this.currentTab,
            dataLoaded: this.dataService.rawData.length > 0,
            filtersActive: this.filterManager.hasActiveFilters(),
            stats: this.dataService.getStatistics()
        };
    }
}

/**
 * Application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global app instance
    window.iattcApp = new App();
    
    // Start the application
    window.iattcApp.init().catch(error => {
        console.error('Failed to start application:', error);
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
        if (window.iattcApp) {
            window.iattcApp.handleError(event.error);
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (window.iattcApp) {
            window.iattcApp.handleError(event.reason);
        }
    });
});

/**
 * Additional CSS for modals and messages (to be added to styles.css)
 */
const additionalStyles = `
.error-message, .warning-message, .help-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.error-content, .warning-content, .help-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.help-content {
    max-width: 600px;
}

.help-content h2 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.help-content h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.help-content ul {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
}

.help-content li {
    margin-bottom: 0.5rem;
}

.row-details-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1500;
}

.details-grid {
    display: grid;
    gap: 1rem;
    margin: 1rem 0;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.detail-item label {
    font-weight: 600;
    color: var(--text-secondary);
}

.table-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-color);
}

.table-pagination button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);
}

.table-pagination button:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
}

.table-pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-weight: 500;
    color: var(--text-secondary);
}

.flag-code, .gear-code, .species-code {
    font-family: monospace;
    font-weight: bold;
    margin-right: 0.5rem;
    color: var(--primary-color);
}

.flag-name, .gear-name, .species-name {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.catch-amount.high-catch {
    color: var(--error-color);
    font-weight: bold;
}

.catch-amount.medium-catch {
    color: var(--warning-color);
    font-weight: 600;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);