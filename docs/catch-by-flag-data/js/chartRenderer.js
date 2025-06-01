/**
 * ChartRenderer - Single Responsibility: Handle all chart rendering
 * Interface Segregation: Specific methods for different chart types
 */
class ChartRenderer {
    constructor(dataService) {
        this.dataService = dataService;
        this.charts = {};
        this.colorPalette = [
            '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
            '#db2777', '#0891b2', '#65a30d', '#dc2626', '#9333ea',
            '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'
        ];
    }
    
    /**
     * Initialize all charts
     */
    initializeCharts() {
        // Set Chart.js defaults
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.color = '#475569';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.boxWidth = 8;
        Chart.defaults.elements.point.radius = 3;
        Chart.defaults.elements.point.hoverRadius = 6;
        
        this.renderSpeciesChart();
        this.renderFlagChart();
        this.renderTrendsChart();
        this.renderGearChart();
        this.renderSpeciesTrendsChart();
        this.renderComparisonChart();
    }
    
    /**
     * Render species distribution chart
     */
    renderSpeciesChart() {
        const data = this.dataService.getAggregatedData('species', 10);
        const ctx = document.getElementById('speciesChart').getContext('2d');
        
        if (this.charts.species) {
            this.charts.species.destroy();
        }
        
        this.charts.species = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => this.dataService.getDisplayName('species', item.label)),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: this.colorPalette.slice(0, data.length),
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
                            font: {
                                size: 12
                            }
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
     * Render flag distribution chart
     */
    renderFlagChart() {
        const data = this.dataService.getAggregatedData('flag');
        const ctx = document.getElementById('flagChart').getContext('2d');
        
        if (this.charts.flag) {
            this.charts.flag.destroy();
        }
        
        this.charts.flag = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => this.dataService.getDisplayName('flag', item.label)),
                datasets: [{
                    label: 'Catch (tonnes)',
                    data: data.map(item => item.value),
                    backgroundColor: this.colorPalette[0],
                    borderColor: this.colorPalette[0],
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
                    },
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
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
     * Render trends over time chart
     */
    renderTrendsChart() {
        const timeSeriesData = this.dataService.getTimeSeriesData();
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }
        
        const years = Object.keys(timeSeriesData).sort();
        const values = years.map(year => timeSeriesData[year]);
        
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Total Catch',
                    data: values,
                    borderColor: this.colorPalette[0],
                    backgroundColor: this.colorPalette[0] + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
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
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y.toLocaleString()} tonnes`
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    /**
     * Render gear type distribution chart
     */
    renderGearChart() {
        const data = this.dataService.getAggregatedData('gear');
        const ctx = document.getElementById('gearChart').getContext('2d');
        
        if (this.charts.gear) {
            this.charts.gear.destroy();
        }
        
        this.charts.gear = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(item => this.dataService.getDisplayName('gear', item.label)),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: this.colorPalette.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
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
     * Render species trends over time
     */
    renderSpeciesTrendsChart() {
        const timeSeriesData = this.dataService.getTimeSeriesData('EspeciesSpecies');
        const ctx = document.getElementById('speciesTrendsChart').getContext('2d');
        
        if (this.charts.speciesTrends) {
            this.charts.speciesTrends.destroy();
        }
        
        // Get top 5 species by total catch
        const speciesData = this.dataService.getAggregatedData('species', 5);
        const topSpecies = speciesData.map(item => item.label);
        
        const years = Object.keys(timeSeriesData).sort();
        const datasets = topSpecies.map((species, index) => ({
            label: this.dataService.getDisplayName('species', species),
            data: years.map(year => timeSeriesData[year][species] || 0),
            borderColor: this.colorPalette[index],
            backgroundColor: this.colorPalette[index] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }));
        
        this.charts.speciesTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: datasets
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
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()} tonnes`
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    /**
     * Render comparison chart
     */
    renderComparisonChart(compareBy = 'flag', metricBy = 'total') {
        const data = this.dataService.getAggregatedData(compareBy);
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }
        
        let chartData = data;
        
        if (metricBy === 'average') {
            // Calculate average per year
            const metadata = this.dataService.getMetadata();
            const yearCount = metadata.years.length;
            chartData = data.map(item => ({
                ...item,
                value: Math.round(item.value / yearCount)
            }));
        }
        
        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(item => this.dataService.getDisplayName(compareBy, item.label)),
                datasets: [{
                    label: metricBy === 'total' ? 'Total Catch (tonnes)' : 'Average Catch per Year (tonnes)',
                    data: chartData.map(item => item.value),
                    backgroundColor: this.colorPalette[1],
                    borderColor: this.colorPalette[1],
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
                    legend: {
                        display: false
                    },
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
     * Update all charts with new data
     */
    updateCharts() {
        this.renderSpeciesChart();
        this.renderFlagChart();
        this.renderTrendsChart();
        this.renderGearChart();
        this.renderSpeciesTrendsChart();
        this.renderComparisonChart();
    }
    
    /**
     * Update comparison chart with new parameters
     */
    updateComparisonChart(compareBy, metricBy) {
        this.renderComparisonChart(compareBy, metricBy);
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
     * Resize all charts (useful for responsive design)
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }
}