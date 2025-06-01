/**
 * TableManager - Single Responsibility: Handle data table operations
 * Open/Closed Principle: Extensible for new table features
 */
class TableManager {
    constructor(dataService) {
        this.dataService = dataService;
        this.tableElement = null;
        this.tbody = null;
        this.searchInput = null;
        this.recordCountElement = null;
        this.currentSort = {
            field: null,
            direction: 'asc'
        };
        this.currentData = [];
        this.filteredData = [];
        this.itemsPerPage = 50;
        this.currentPage = 1;
    }
    
    /**
     * Initialize table components
     */
    initializeTable() {
        this.tableElement = document.getElementById('dataTable');
        this.tbody = this.tableElement.querySelector('tbody');
        this.searchInput = document.getElementById('searchTable');
        this.recordCountElement = document.getElementById('recordCount');
        
        this.attachEventListeners();
        this.updateTable();
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
        
        // Column sorting
        const headers = this.tableElement.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                this.sortTable(field);
            });
        });
        
        // Keyboard shortcuts for table
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        if (document.activeElement !== this.searchInput) {
                            e.preventDefault();
                            this.searchInput.focus();
                        }
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportTableData();
                        break;
                }
            }
        });
    }
    
    /**
     * Update table with current data
     */
    updateTable() {
        this.currentData = this.dataService.getData();
        this.filteredData = [...this.currentData];
        this.renderTable();
        this.updateRecordCount();
    }
    
    /**
     * Render table rows
     */
    renderTable() {
        // Clear existing rows
        this.tbody.innerHTML = '';
        
        // Apply current search if exists
        if (this.searchInput.value.trim()) {
            this.performSearch(this.searchInput.value, false);
        }
        
        // Sort data if needed
        const dataToRender = this.getSortedData();
        
        // Paginate data
        const paginatedData = this.getPaginatedData(dataToRender);
        
        // Create rows
        paginatedData.forEach(record => {
            const row = this.createTableRow(record);
            this.tbody.appendChild(row);
        });
        
        // Add pagination controls if needed
        this.updatePaginationControls(dataToRender.length);
    }
    
    /**
     * Create a table row
     * @param {Object} record - Data record
     */
    createTableRow(record) {
        const row = document.createElement('tr');
        
        // Year
        const yearCell = document.createElement('td');
        yearCell.textContent = record.AnoYear;
        row.appendChild(yearCell);
        
        // Flag
        const flagCell = document.createElement('td');
        flagCell.innerHTML = `
            <span class="flag-code">${record.BanderaFlag}</span>
            <span class="flag-name">${this.dataService.getDisplayName('flag', record.BanderaFlag)}</span>
        `;
        row.appendChild(flagCell);
        
        // Gear
        const gearCell = document.createElement('td');
        gearCell.innerHTML = `
            <span class="gear-code">${record.ArteGear}</span>
            <span class="gear-name">${this.dataService.getDisplayName('gear', record.ArteGear)}</span>
        `;
        row.appendChild(gearCell);
        
        // Species
        const speciesCell = document.createElement('td');
        speciesCell.innerHTML = `
            <span class="species-code">${record.EspeciesSpecies}</span>
            <span class="species-name">${this.dataService.getDisplayName('species', record.EspeciesSpecies)}</span>
        `;
        row.appendChild(speciesCell);
        
        // Catch amount
        const catchCell = document.createElement('td');
        catchCell.textContent = record.t.toLocaleString();
        catchCell.classList.add('catch-amount');
        
        // Add visual indicator for large catches
        if (record.t > 10000) {
            catchCell.classList.add('high-catch');
        } else if (record.t > 1000) {
            catchCell.classList.add('medium-catch');
        }
        
        row.appendChild(catchCell);
        
        // Add click handler for row details
        row.addEventListener('click', () => {
            this.showRowDetails(record);
        });
        
        return row;
    }
    
    /**
     * Perform search on table data
     * @param {string} query - Search query
     * @param {boolean} reRender - Whether to re-render table
     */
    performSearch(query, reRender = true) {
        if (!query || query.trim() === '') {
            this.filteredData = [...this.currentData];
        } else {
            this.filteredData = this.dataService.searchData(query);
        }
        
        if (reRender) {
            this.renderTable();
            this.updateRecordCount();
        }
    }
    
    /**
     * Sort table by field
     * @param {string} field - Field to sort by
     */
    sortTable(field) {
        // Update sort direction
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        // Update header classes
        this.updateSortHeaders();
        
        // Re-render table
        this.renderTable();
    }
    
    /**
     * Get sorted data
     */
    getSortedData() {
        if (!this.currentSort.field) {
            return this.filteredData;
        }
        
        return [...this.filteredData].sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];
            
            // Handle numeric sorting
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return this.currentSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            
            // Handle string sorting
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            
            if (this.currentSort.direction === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }
    
    /**
     * Update sort header indicators
     */
    updateSortHeaders() {
        const headers = this.tableElement.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            
            if (header.getAttribute('data-sort') === this.currentSort.field) {
                header.classList.add(`sort-${this.currentSort.direction}`);
            }
        });
    }
    
    /**
     * Get paginated data
     * @param {Array} data - Data to paginate
     */
    getPaginatedData(data) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return data.slice(startIndex, endIndex);
    }
    
    /**
     * Update pagination controls
     * @param {number} totalItems - Total number of items
     */
    updatePaginationControls(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Remove existing pagination
        const existingPagination = document.querySelector('.table-pagination');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        // Don't show pagination if only one page
        if (totalPages <= 1) return;
        
        // Create pagination container
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'table-pagination';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Page info
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        pageInfo.className = 'page-info';
        paginationContainer.appendChild(pageInfo);
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });
        paginationContainer.appendChild(nextButton);
        
        // Add after table
        this.tableElement.parentNode.appendChild(paginationContainer);
    }
    
    /**
     * Update record count display
     */
    updateRecordCount() {
        const count = this.filteredData.length;
        const total = this.currentData.length;
        
        if (count === total) {
            this.recordCountElement.textContent = `${count.toLocaleString()} records`;
        } else {
            this.recordCountElement.textContent = `${count.toLocaleString()} of ${total.toLocaleString()} records`;
        }
    }
    
    /**
     * Show detailed information for a row
     * @param {Object} record - Record to show details for
     */
    showRowDetails(record) {
        // Create or update details modal/panel
        let detailsPanel = document.getElementById('rowDetails');
        
        if (!detailsPanel) {
            detailsPanel = document.createElement('div');
            detailsPanel.id = 'rowDetails';
            detailsPanel.className = 'row-details-panel';
            document.body.appendChild(detailsPanel);
        }
        
        detailsPanel.innerHTML = `
            <div class="details-content">
                <h3>Catch Record Details</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Year:</label>
                        <span>${record.AnoYear}</span>
                    </div>
                    <div class="detail-item">
                        <label>Flag:</label>
                        <span>${record.BanderaFlag} - ${this.dataService.getDisplayName('flag', record.BanderaFlag)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Gear Type:</label>
                        <span>${record.ArteGear} - ${this.dataService.getDisplayName('gear', record.ArteGear)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Species:</label>
                        <span>${record.EspeciesSpecies} - ${this.dataService.getDisplayName('species', record.EspeciesSpecies)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Catch Amount:</label>
                        <span>${record.t.toLocaleString()} tonnes</span>
                    </div>
                </div>
                <button class="close-details">Close</button>
            </div>
        `;
        
        detailsPanel.style.display = 'block';
        
        // Close button handler
        detailsPanel.querySelector('.close-details').addEventListener('click', () => {
            detailsPanel.style.display = 'none';
        });
        
        // Close on outside click
        detailsPanel.addEventListener('click', (e) => {
            if (e.target === detailsPanel) {
                detailsPanel.style.display = 'none';
            }
        });
    }
    
    /**
     * Export table data as CSV
     */
    exportTableData() {
        const csvData = this.dataService.exportToCSV();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `iattc_catch_data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    /**
     * Clear search
     */
    clearSearch() {
        this.searchInput.value = '';
        this.performSearch('');
    }
    
    /**
     * Reset table state
     */
    resetTable() {
        this.clearSearch();
        this.currentSort = { field: null, direction: 'asc' };
        this.currentPage = 1;
        this.updateSortHeaders();
        this.updateTable();
    }
    
    /**
     * Get table statistics
     */
    getTableStats() {
        return {
            totalRecords: this.currentData.length,
            filteredRecords: this.filteredData.length,
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            totalPages: Math.ceil(this.filteredData.length / this.itemsPerPage),
            sortField: this.currentSort.field,
            sortDirection: this.currentSort.direction,
            searchQuery: this.searchInput.value
        };
    }
}