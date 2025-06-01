/**
 * TableManager for Purse Seine Geo Explorer
 * Handles data table operations and interactions
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
        
        // Download CSV button
        const downloadBtn = document.getElementById('downloadCSV');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadCSV();
            });
        }
        
        // Keyboard shortcuts
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
                        this.downloadCSV();
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
     */
    createTableRow(record) {
        const row = document.createElement('tr');
        
        // Year
        const yearCell = document.createElement('td');
        yearCell.textContent = record.Year;
        row.appendChild(yearCell);
        
        // Month
        const monthCell = document.createElement('td');
        monthCell.textContent = this.dataService.getMonthName(record.Month);
        row.appendChild(monthCell);
        
        // Latitude
        const latCell = document.createElement('td');
        latCell.textContent = record.LatC1.toFixed(1);
        latCell.classList.add('coordinate');
        row.appendChild(latCell);
        
        // Longitude
        const lonCell = document.createElement('td');
        lonCell.textContent = record.LonC1.toFixed(1);
        lonCell.classList.add('coordinate');
        row.appendChild(lonCell);
        
        // Set Type
        const setTypeCell = document.createElement('td');
        const setTypeInfo = this.dataService.getSetTypeInfo(record.SetType);
        setTypeCell.innerHTML = `
            <span title="${setTypeInfo.description}">${setTypeInfo.name}</span>
        `;
        row.appendChild(setTypeCell);
        
        // Number of Sets
        const setsCell = document.createElement('td');
        setsCell.textContent = record.NumSets;
        setsCell.classList.add('catch-value');
        row.appendChild(setsCell);
        
        // Total Catch
        const totalCatchCell = document.createElement('td');
        totalCatchCell.textContent = record.total_catch.toFixed(1);
        totalCatchCell.classList.add('catch-value');
        
        // Add visual indicator for catch levels
        if (record.total_catch > 100) {
            totalCatchCell.classList.add('catch-high');
        } else if (record.total_catch > 20) {
            totalCatchCell.classList.add('catch-medium');
        } else if (record.total_catch > 0) {
            totalCatchCell.classList.add('catch-low');
        }
        
        row.appendChild(totalCatchCell);
        
        // YFT Catch
        const yftCell = document.createElement('td');
        yftCell.textContent = (record.YFT || 0).toFixed(1);
        yftCell.classList.add('catch-value');
        row.appendChild(yftCell);
        
        // SKJ Catch
        const skjCell = document.createElement('td');
        skjCell.textContent = (record.SKJ || 0).toFixed(1);
        skjCell.classList.add('catch-value');
        row.appendChild(skjCell);
        
        // BET Catch
        const betCell = document.createElement('td');
        betCell.textContent = (record.BET || 0).toFixed(1);
        betCell.classList.add('catch-value');
        row.appendChild(betCell);
        
        // Add click handler for row details
        row.addEventListener('click', () => {
            this.showRowDetails(record);
        });
        
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'var(--bg-tertiary)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = '';
        });
        
        return row;
    }
    
    /**
     * Perform search on table data
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
            
            // Special handling for total_catch
            if (this.currentSort.field === 'total_catch') {
                aVal = a.total_catch;
                bVal = b.total_catch;
            }
            
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
     */
    getPaginatedData(data) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return data.slice(startIndex, endIndex);
    }
    
    /**
     * Update pagination controls
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
        
        // Add after table container
        const tableContainer = document.querySelector('.data-table-container');
        if (tableContainer) {
            tableContainer.appendChild(paginationContainer);
        }
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
     */
    showRowDetails(record) {
        // Create or update details modal
        let detailsModal = document.getElementById('recordDetails');
        
        if (!detailsModal) {
            detailsModal = document.createElement('div');
            detailsModal.id = 'recordDetails';
            detailsModal.className = 'record-details-modal';
            document.body.appendChild(detailsModal);
        }
        
        // Get species breakdown
        const speciesData = Object.keys(this.dataService.speciesInfo)
            .map(species => ({
                code: species,
                name: this.dataService.getSpeciesInfo(species).name,
                catch: record[species] || 0
            }))
            .filter(item => item.catch > 0)
            .sort((a, b) => b.catch - a.catch);
        
        const speciesHTML = speciesData.map(item => 
            `<div class="species-item">
                <span class="species-name">${item.name} (${item.code}):</span>
                <span class="species-catch">${item.catch.toFixed(1)} tonnes</span>
            </div>`
        ).join('');
        
        detailsModal.innerHTML = `
            <div class="details-content">
                <div class="details-header">
                    <h3>Fishing Record Details</h3>
                    <button class="close-details">×</button>
                </div>
                <div class="details-body">
                    <div class="details-section">
                        <h4>Location & Time</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Coordinates:</label>
                                <span>${record.LatC1}°, ${record.LonC1}°</span>
                            </div>
                            <div class="detail-item">
                                <label>Date:</label>
                                <span>${this.dataService.getMonthName(record.Month)} ${record.Year}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h4>Fishing Activity</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Set Type:</label>
                                <span>${this.dataService.getSetTypeInfo(record.SetType).name}</span>
                            </div>
                            <div class="detail-item">
                                <label>Number of Sets:</label>
                                <span>${record.NumSets}</span>
                            </div>
                            <div class="detail-item">
                                <label>Total Catch:</label>
                                <span>${record.total_catch.toFixed(1)} tonnes</span>
                            </div>
                            <div class="detail-item">
                                <label>CPUE:</label>
                                <span>${record.cpue.toFixed(2)} tonnes/set</span>
                            </div>
                        </div>
                    </div>
                    
                    ${speciesData.length > 0 ? `
                        <div class="details-section">
                            <h4>Species Composition</h4>
                            <div class="species-breakdown">
                                ${speciesHTML}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        detailsModal.style.display = 'flex';
        
        // Close button handler
        detailsModal.querySelector('.close-details').addEventListener('click', () => {
            detailsModal.style.display = 'none';
        });
        
        // Close on outside click
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                detailsModal.style.display = 'none';
            }
        });
    }
    
    /**
     * Download table data as CSV
     */
    downloadCSV() {
        const csvData = this.dataService.exportToCSV();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `purse_seine_data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
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
    
    /**
     * Highlight cells on map based on table selection
     */
    highlightMapCells(coordinates) {
        // This would integrate with the map service to highlight specific cells
        // Implementation would depend on map service capabilities
        console.log('Highlighting map cells:', coordinates);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TableManager;
}