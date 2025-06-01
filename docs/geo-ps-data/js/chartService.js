/**
 * ChartService for Purse Seine Geo Explorer
 * Handles Chart.js visualizations for fisheries data
 */
class ChartService {
    constructor(dataService) {
        this.dataService = dataService;
        this.charts = {};
        
        // Chart.js defaults
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.color = '#475569';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.boxWidth = 8;
    }
    
    /**
     * Initialize all charts
     */
    initializeCharts() {
        this.renderSpeciesChart();
        this.renderSetTypeChart();
        this.renderMonthlyChart();
        this.renderSpatialChart();
        this.renderTemporalChart();
        this.renderSeasonalChart();
        this.renderInterannualChart();
    }
    
    /**
     * Render species composition chart
     */
    renderSpeciesChart() {
        const data = this.dataService.getChartData('species');
        const ctx = document.getElementById('speciesChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.species) {
            this.charts.species.destroy();
        }
        
        this.charts.species = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.label),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: data.map(item => item.color),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toLocaleString()} tonnes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render set type comparison chart
     */
    renderSetTypeChart() {
        const data = this.dataService.getChartData('setType');
        const ctx = document.getElementById('setTypeChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.setType) {
            this.charts.setType.destroy();
        }
        
        const colors = ['#2563eb', '#dc2626', '#059669', '#d97706'];
        
        this.charts.setType = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.label),
                datasets: [{
                    label: 'Catch (tonnes)',
                    data: data.map(item => item.value),
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: colors.slice(0, data.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const setData = data[context.dataIndex];
                                return `Sets: ${setData.sets.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render monthly distribution chart
     */
    renderMonthlyChart() {
        const data = this.dataService.getChartData('monthly');
        const ctx = document.getElementById('monthlyChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }
        
        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.label.substring(0, 3)), // Short month names
                datasets: [{
                    label: 'Total Catch',
                    data: data.map(item => item.catch),
                    borderColor: '#2563eb',
                    backgroundColor: '#2563eb20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Number of Sets',
                    data: data.map(item => item.sets),
                    borderColor: '#dc2626',
                    backgroundColor: '#dc262620',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                const unit = context.datasetIndex === 0 ? ' tonnes' : ' sets';
                                return `${context.dataset.label}: ${value.toLocaleString()}${unit}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render spatial distribution chart (latitude bins)
     */
    renderSpatialChart() {
        const spatialData = this.dataService.getSpatialData('total_catch');
        const ctx = document.getElementById('spatialChart')?.getContext('2d');
        if (!ctx) return;
        
        // Create latitude bins
        const latBins = {};
        spatialData.forEach(cell => {
            const latBin = Math.floor(cell.lat / 5) * 5; // 5-degree bins
            if (!latBins[latBin]) {
                latBins[latBin] = 0;
            }
            latBins[latBin] += cell.value;
        });
        
        const sortedBins = Object.entries(latBins)
            .sort(([a], [b]) => parseFloat(b) - parseFloat(a)) // North to South
            .map(([lat, catch_val]) => ({
                label: `${lat}° - ${parseFloat(lat) + 5}°N`,
                value: catch_val
            }));
        
        if (this.charts.spatial) {
            this.charts.spatial.destroy();
        }
        
        this.charts.spatial = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedBins.map(item => item.label),
                datasets: [{
                    label: 'Catch by Latitude',
                    data: sortedBins.map(item => item.value),
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.x.toLocaleString()} tonnes`
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render temporal trends chart
     */
    renderTemporalChart() {
        const data = this.dataService.getChartData('temporal');
        const ctx = document.getElementById('temporalChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.temporal) {
            this.charts.temporal.destroy();
        }
        
        this.charts.temporal = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: 'Total Catch',
                    data: data.map(item => item.catch),
                    borderColor: '#2563eb',
                    backgroundColor: '#2563eb20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (contexts) => {
                                const item = data[contexts[0].dataIndex];
                                return `${this.dataService.getMonthName(item.month)} ${item.year}`;
                            },
                            label: (context) => `${context.parsed.y.toLocaleString()} tonnes`
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render seasonal patterns chart
     */
    renderSeasonalChart() {
        const monthlyData = this.dataService.getChartData('monthly');
        const ctx = document.getElementById('seasonalChart')?.getContext('2d');
        if (!ctx) return;
        
        if (this.charts.seasonal) {
            this.charts.seasonal.destroy();
        }
        
        this.charts.seasonal = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: monthlyData.map(item => item.label.substring(0, 3)),
                datasets: [{
                    label: 'Monthly Catch Pattern',
                    data: monthlyData.map(item => item.catch),
                    borderColor: '#d97706',
                    backgroundColor: '#d9770620',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.r.toLocaleString()} tonnes`
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Render inter-annual variability chart
     */
    renderInterannualChart() {
        const temporalData = this.dataService.getChartData('temporal');
        const ctx = document.getElementById('interannualChart')?.getContext('2d');
        if (!ctx) return;
        
        // Aggregate by year
        const yearlyData = {};
        temporalData.forEach(item => {
            if (!yearlyData[item.year]) {
                yearlyData[item.year] = 0;
            }
            yearlyData[item.year] += item.catch;
        });
        
        const sortedYears = Object.entries(yearlyData)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([year, catch_val]) => ({ year: parseInt(year), catch: catch_val }));
        
        if (this.charts.interannual) {
            this.charts.interannual.destroy();
        }
        
        this.charts.interannual = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedYears.map(item => item.year),
                datasets: [{
                    label: 'Annual Catch',
                    data: sortedYears.map(item => item.catch),
                    backgroundColor: '#7c3aed',
                    borderColor: '#7c3aed',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y.toLocaleString()} tonnes`
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update charts with new data
     */
    updateCharts() {
        // Update all charts with current filtered data
        this.renderSpeciesChart();
        this.renderSetTypeChart();
        this.renderMonthlyChart();
        this.renderSpatialChart();
        this.renderTemporalChart();
        this.renderSeasonalChart();
        this.renderInterannualChart();
    }
    
    /**
     * Update temporal chart based on grouping selection
     */
    updateTemporalChart(metric = 'total_catch', grouping = 'month') {
        const ctx = document.getElementById('temporalChart')?.getContext('2d');
        if (!ctx) return;
        
        let data, labels, title;
        
        switch (grouping) {
            case 'year':
                const temporalData = this.dataService.getChartData('temporal');
                const yearlyData = {};
                temporalData.forEach(item => {
                    if (!yearlyData[item.year]) {
                        yearlyData[item.year] = { catch: 0, sets: 0 };
                    }
                    yearlyData[item.year].catch += item.catch;
                    yearlyData[item.year].sets += item.sets;
                });
                
                const years = Object.keys(yearlyData).sort().map(Number);
                labels = years;
                data = years.map(year => {
                    const yearData = yearlyData[year];
                    switch (metric) {
                        case 'num_sets': return yearData.sets;
                        case 'cpue': return yearData.sets > 0 ? yearData.catch / yearData.sets : 0;
                        default: return yearData.catch;
                    }
                });
                title = `Annual ${metric.replace('_', ' ').toUpperCase()}`;
                break;
                
            case 'season':
                const seasonData = { Winter: 0, Spring: 0, Summer: 0, Fall: 0 };
                const monthlyData = this.dataService.getChartData('monthly');
                monthlyData.forEach((item, index) => {
                    const season = index < 2 || index === 11 ? 'Winter' :
                                  index < 5 ? 'Spring' :
                                  index < 8 ? 'Summer' : 'Fall';
                    seasonData[season] += item[metric === 'num_sets' ? 'sets' : 'catch'];
                });
                
                labels = Object.keys(seasonData);
                data = Object.values(seasonData);
                title = `Seasonal ${metric.replace('_', ' ').toUpperCase()}`;
                break;
                
            default: // month
                const monthly = this.dataService.getChartData('monthly');
                labels = monthly.map(item => item.label.substring(0, 3));
                data = monthly.map(item => {
                    switch (metric) {
                        case 'num_sets': return item.sets;
                        case 'cpue': return item.sets > 0 ? item.catch / item.sets : 0;
                        default: return item.catch;
                    }
                });
                title = `Monthly ${metric.replace('_', ' ').toUpperCase()}`;
        }
        
        if (this.charts.temporal) {
            this.charts.temporal.destroy();
        }
        
        this.charts.temporal = new Chart(ctx, {
            type: grouping === 'season' ? 'bar' : 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    borderColor: '#2563eb',
                    backgroundColor: grouping === 'season' ? '#2563eb' : '#2563eb20',
                    borderWidth: 2,
                    fill: grouping !== 'season',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        });
    }
    
    /**
     * Destroy all charts
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
    
    /**
     * Resize all charts
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartService;
}