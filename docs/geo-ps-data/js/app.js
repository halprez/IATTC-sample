/**
 * Main Application Class for Purse Seine Geo Explorer
 * Orchestrates all services following SOLID principles
 */
class PurseSeineApp {
    constructor() {
        this.dataService = new DataService();
        this.mapService = new MapService(this.dataService);
        this.chartService = new ChartService(this.dataService);
        this.filterManager = new FilterManager(this.dataService);
        this.tableManager = new TableManager(this.dataService);
        
        this.currentTab = 'map';
        this.currentDisplayMetric = 'total_catch';
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
            
            // Initialize all services
            this.initializeServices();
            
            // Setup observers and event handlers
            this.setupObservers();
            
            // Initial render
            this.updateAll();
            
            this.isInitialized = true;
            this.hideLoading();
            
            console.log('🗺️ Purse Seine Geo Explorer initialized successfully');
            this.showWelcomeMessage();
            
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
        
        // Initialize display metric controls
        this.initializeDisplayControls();
        
        // Initialize temporal controls
        this.initializeTemporalControls();
        
        // Initialize export controls
        this.initializeExportControls();
        
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
        
        // Handle tab-specific actions
        switch (tabId) {
            case 'map':
                setTimeout(() => {
                    this.mapService.resize();
                }, 100);
                break;
            case 'statistics':
            case 'temporal':
                setTimeout(() => {
                    this.chartService.resizeCharts();
                }, 100);
                break;
        }
    }
    
    /**
     * Initialize display metric controls
     */
    initializeDisplayControls() {
        const displayMetricSelect = document.getElementById('displayMetric');
        
        if (displayMetricSelect) {
            displayMetricSelect.addEventListener('change', (e) => {
                this.currentDisplayMetric = e.target.value;
                this.updateMapDisplay();
            });
        }
    }
    
    /**
     * Initialize temporal controls
     */
    initializeTemporalControls() {
        const temporalMetricSelect = document.getElementById('temporalMetric');
        const temporalGroupingSelect = document.getElementById('temporalGrouping');
        
        if (temporalMetricSelect && temporalGroupingSelect) {
            const updateTemporal = () => {
                this.chartService.updateTemporalChart(
                    temporalMetricSelect.value,
                    temporalGroupingSelect.value
                );
            };
            
            temporalMetricSelect.addEventListener('change', updateTemporal);
            temporalGroupingSelect.addEventListener('change', updateTemporal);
        }
    }
    
    /**
     * Initialize export controls
     */
    initializeExportControls() {
        const exportDataBtn = document.getElementById('exportData');
        
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportCurrentView();
            });
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
                const tabs = ['map', 'statistics', 'temporal', 'details'];
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
                    case 'm':
                        e.preventDefault();
                        this.mapService.exportMap();
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
                this.handleResize();
            }, 250);
        });
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 500);
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.mapService.resize();
        this.chartService.resizeCharts();
    }
    
    /**
     * Load application data
     */
    async loadData() {
        try {
            await this.dataService.loadData();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showWarning('Main dataset unavailable. Please ensure PublicPSTunaSetType2013-2023.json is in the data/ folder.');
        }
    }
    
    /**
     * Initialize all services
     */
    initializeServices() {
        this.filterManager.initializeFilters();
        this.tableManager.initializeTable();
        this.mapService.initializeMap();
        this.chartService.initializeCharts();
    }
    
    /**
     * Setup observer patterns
     */
    setupObservers() {
        // Filter changes update all components
        this.filterManager.addObserver((filterData) => {
            this.updateStatistics();
            this.updateMapDisplay();
            this.chartService.updateCharts();
            this.tableManager.updateTable();
        });
    }
    
    /**
     * Update all components
     */
    updateAll() {
        this.updateStatistics();
        this.updateMapDisplay();
        this.chartService.updateCharts();
        this.tableManager.updateTable();
    }
    
    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = this.dataService.getStatistics();
        
        // Update stat cards
        this.updateStatCard('totalCatch', stats.totalCatch.toLocaleString());
        this.updateStatCard('totalSets', stats.totalSets.toLocaleString());
        this.updateStatCard('activeCells', stats.activeCells.toLocaleString());
        this.updateStatCard('avgCPUE', stats.avgCPUE.toFixed(2));
    }
    
    /**
     * Update individual stat card
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
     * Update map display
     */
    updateMapDisplay() {
        this.mapService.updateMapData(this.currentDisplayMetric);
    }
    
    /**
     * Export current view data
     */
    exportCurrentView() {
        const currentData = this.dataService.getData();
        const currentFilters = this.filterManager.getCurrentFilters();
        
        // Create export package
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                application: 'IATTC Purse Seine Geo Explorer',
                filters: currentFilters,
                recordCount: currentData.length,
                displayMetric: this.currentDisplayMetric
            },
            data: currentData
        };
        
        // Download as JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `purse_seine_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        this.showMessage('Data exported successfully!', 'success');
    }
    
    /**
     * Save current application state
     */
    saveCurrentState() {
        const state = {
            filters: this.filterManager.getCurrentFilters(),
            currentTab: this.currentTab,
            displayMetric: this.currentDisplayMetric,
            mapExtent: this.mapService.getCurrentExtent(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(state, null, 2)], { 
            type: 'application/json' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `purse_seine_state_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    /**
     * Show help modal
     */
    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <h2>🗺️ Purse Seine Geo Explorer - Help</h2>
                
                <h3>Navigation</h3>
                <ul>
                    <li><strong>Alt + 1-4:</strong> Switch between tabs</li>
                    <li><strong>Ctrl/Cmd + R:</strong> Reset all filters</li>
                    <li><strong>Ctrl/Cmd + F:</strong> Focus search in Details tab</li>
                    <li><strong>Ctrl/Cmd + E:</strong> Export filtered data</li>
                    <li><strong>Ctrl/Cmd + M:</strong> Export map as image</li>
                    <li><strong>Ctrl/Cmd + H:</strong> Show this help</li>
                </ul>
                
                <h3>Features</h3>
                <ul>
                    <li><strong>Interactive Map:</strong> Click cells to see catch details</li>
                    <li><strong>Statistics:</strong> Overview charts and summaries</li>
                    <li><strong>Temporal Analysis:</strong> Time series and seasonal patterns</li>
                    <li><strong>Data Details:</strong> Searchable and sortable data table</li>
                </ul>
                
                <h3>Filtering</h3>
                <p>Use the controls at the top to filter by year, month, set type, and primary species. All visualizations update automatically.</p>
                
                <h3>Map Legend</h3>
                <p>Colors indicate catch intensity in 1°×1° grid cells. Click cells for detailed information.</p>
                
                <h3>Set Types</h3>
                <ul>
                    <li><strong>DEL (Dolphin Associated):</strong> Sets made on dolphins</li>
                    <li><strong>NOA (No Association):</strong> Sets on unassociated schools</li>
                    <li><strong>OBJ (Floating Object):</strong> Sets on floating objects</li>
                </ul>
                
                <h3>Data Source</h3>
                <p>Public domain data from the Inter-American Tropical Tuna Commission (IATTC)</p>
                
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
     * Show welcome message
     */
    showWelcomeMessage() {
        const stats = this.dataService.getStatistics();
        const message = `Welcome! Loaded ${stats.totalCatch.toLocaleString()} tonnes of catch data from ${stats.activeCells} fishing areas.`;
        this.showMessage(message, 'success');
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
     * Show message to user
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            z-index: 1000;
            max-width: 400px;
            font-weight: 500;
        `;
        
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#d1fae5';
                messageDiv.style.color = '#065f46';
                messageDiv.style.border = '1px solid #10b981';
                break;
            case 'warning':
                messageDiv.style.backgroundColor = '#fef3c7';
                messageDiv.style.color = '#92400e';
                messageDiv.style.border = '1px solid #f59e0b';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#fee2e2';
                messageDiv.style.color = '#991b1b';
                messageDiv.style.border = '1px solid #ef4444';
                break;
            default:
                messageDiv.style.backgroundColor = '#e0f2fe';
                messageDiv.style.color = '#164e63';
                messageDiv.style.border = '1px solid #0891b2';
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.hideLoading();
        this.showMessage(message, 'error');
    }
    
    /**
     * Show warning message
     */
    showWarning(message) {
        this.showMessage(message, 'warning');
    }
    
    /**
     * Handle application errors
     */
    handleError(error) {
        //console.error('Application error:', error);
        //this.showError('An unexpected error occurred. Please refresh the page and try again.');
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentTab: this.currentTab,
            displayMetric: this.currentDisplayMetric,
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
    window.purseSeineApp = new PurseSeineApp();
    
    // Start the application
    window.purseSeineApp.init().catch(error => {
        console.error('Failed to start application:', error);
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
        if (window.purseSeineApp) {
            window.purseSeineApp.handleError(event.error);
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (window.purseSeineApp) {
            window.purseSeineApp.handleError(event.reason);
        }
    });
});

// Additional CSS for modals and messages (inject into head)
const additionalStyles = `
.help-modal, .record-details-modal {
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

.help-content, .details-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    margin: 2rem;
}

.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.close-details {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
    padding: 0.25rem;
}

.details-section {
    margin-bottom: 1.5rem;
}

.details-section h4 {
    margin-bottom: 0.75rem;
    color: var(--primary-color);
    font-weight: 600;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--bg-tertiary);
}

.detail-item label {
    font-weight: 500;
    color: var(--text-secondary);
}

.species-breakdown {
    display: grid;
    gap: 0.5rem;
}

.species-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
}

.species-name {
    font-weight: 500;
    color: var(--text-primary);
}

.species-catch {
    font-weight: 600;
    color: var(--primary-color);
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
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);