/**
 * MapService for Purse Seine Geo Explorer
 * Handles OpenLayers map functionality and spatial visualization
 */
class MapService {
    constructor(dataService) {
        this.dataService = dataService;
        this.map = null;
        this.vectorLayer = null;
        this.vectorSource = null;
        this.popup = null;
        this.currentMetric = 'total_catch';
        
        // Color scales from config
        this.colorScales = getConfig('map.colorScales', {
            total_catch: {
                thresholds: [1, 50, 200, 1000],
                colors: ['#fee2e2', '#fbbf24', '#f59e0b', '#dc2626']
            },
            num_sets: {
                thresholds: [1, 5, 15, 50],
                colors: ['#dbeafe', '#60a5fa', '#3b82f6', '#1d4ed8']
            },
            cpue: {
                thresholds: [0.1, 5, 15, 50],
                colors: ['#d1fae5', '#34d399', '#10b981', '#059669']
            }
        });
        
        // EPO bounds from config
        this.epoBounds = getConfig('map.bounds', {
            west: -150,
            east: -70,
            south: -30,
            north: 40
        });
    }
    
    /**
     * Initialize the map
     */
    initializeMap(containerId = 'mapView') {
        // Create popup overlay
        this._createPopup();
        
        // Create vector source and layer for grid cells
        this.vectorSource = new ol.source.Vector();
        this.vectorLayer = new ol.layer.Vector({
            source: this.vectorSource,
            style: this._getFeatureStyle.bind(this)
        });
        
        // Create base layers
        const osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            opacity: 0.6
        });
        
        // Create map
        const mapCenter = getConfig('map.center', [-110, 5]);
        const mapZoom = getConfig('map.zoom', 4);
        const minZoom = getConfig('map.minZoom', 2);
        const maxZoom = getConfig('map.maxZoom', 10);
        
        this.map = new ol.Map({
            target: containerId,
            layers: [osmLayer, this.vectorLayer],
            overlays: [this.popup],
            view: new ol.View({
                center: ol.proj.fromLonLat(mapCenter),
                zoom: mapZoom,
                minZoom: minZoom,
                maxZoom: maxZoom,
                extent: ol.proj.transformExtent([
                    this.epoBounds.west, this.epoBounds.south,
                    this.epoBounds.east, this.epoBounds.north
                ], 'EPSG:4326', 'EPSG:3857')
            }),
            // controls: ol.control.defaults().extend([
            //     new ol.control.ScaleLine(),
            //     new ol.control.FullScreen()
            // ])
        });
        
        // Add click handler
        this.map.on('click', this._onMapClick.bind(this));
        
        // Add pointer move handler for hover effects
        this.map.on('pointermove', this._onPointerMove.bind(this));
        
        console.log('Map initialized successfully');
        return this.map;
    }
    
    /**
     * Create popup overlay
     */
    _createPopup() {
        const popupElement = document.createElement('div');
        popupElement.className = 'ol-popup';
        popupElement.innerHTML = `
            <a href="#" class="ol-popup-closer"></a>
            <div class="popup-content"></div>
        `;
        
        this.popup = new ol.Overlay({
            element: popupElement,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        
        // Close popup handler
        popupElement.querySelector('.ol-popup-closer').onclick = () => {
            this.popup.setPosition(undefined);
            return false;
        };
    }
    
    /**
     * Update map display with new data
     */
    updateMapData(metric = 'total_catch') {
        this.currentMetric = metric;
        this.vectorSource.clear();
        
        const spatialData = this.dataService.getSpatialData(metric);
        
        if (spatialData.length === 0) {
            console.warn('No spatial data to display');
            return;
        }
        
        // Create features for each grid cell
        spatialData.forEach(cellData => {
            const feature = this._createGridCellFeature(cellData);
            this.vectorSource.addFeature(feature);
        });
        
        // Update legend
        this._updateLegend(metric);
        
        console.log(`Map updated with ${spatialData.length} cells for metric: ${metric}`);
    }
    
    /**
     * Create a grid cell feature (1°x1° square)
     */
    _createGridCellFeature(cellData) {
        const { lat, lon, value, cell } = cellData;
        
        // Create 1°x1° polygon
        const coordinates = [
            [lon - 0.5, lat - 0.5],
            [lon + 0.5, lat - 0.5],
            [lon + 0.5, lat + 0.5],
            [lon - 0.5, lat + 0.5],
            [lon - 0.5, lat - 0.5]
        ];
        
        const polygon = new ol.geom.Polygon([coordinates]);
        polygon.transform('EPSG:4326', 'EPSG:3857');
        
        const feature = new ol.Feature({
            geometry: polygon,
            value: value,
            cellData: cell,
            lat: lat,
            lon: lon
        });
        
        return feature;
    }
    
    /**
     * Get style for features based on value
     */
    _getFeatureStyle(feature) {
        const value = feature.get('value');
        const color = this._getColorForValue(value, this.currentMetric);
        
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: color + 'CC' // Add transparency
            }),
            stroke: new ol.style.Stroke({
                color: color,
                width: 1
            })
        });
    }
    
    /**
     * Get color for value based on metric thresholds
     */
    _getColorForValue(value, metric) {
        const scale = this.colorScales[metric] || this.colorScales.total_catch;
        
        for (let i = scale.thresholds.length - 1; i >= 0; i--) {
            if (value >= scale.thresholds[i]) {
                return scale.colors[i];
            }
        }
        
        return scale.colors[0];
    }
    
    /**
     * Handle map click events
     */
    _onMapClick(event) {
        const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        
        if (feature) {
            const cellData = feature.get('cellData');
            const lat = feature.get('lat');
            const lon = feature.get('lon');
            
            // Show popup
            this._showPopup(event.coordinate, cellData, lat, lon);
            
            // Update info panel
            this._updateInfoPanel(cellData, lat, lon);
        } else {
            // Hide popup if clicking on empty area
            this.popup.setPosition(undefined);
        }
    }
    
    /**
     * Handle pointer move for hover effects
     */
    _onPointerMove(event) {
        const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        
        // Change cursor style
        this.map.getTarget().style.cursor = feature //? 'pointer' : '';
    }
    
    /**
     * Show popup with cell information
     */
    _showPopup(coordinate, cellData, lat, lon) {
        const popupContent = this.popup.getElement().querySelector('.popup-content');
        
        const topSpecies = Object.entries(cellData.speciesCatch)
            .filter(([species, catch_val]) => catch_val > 0)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([species, catch_val]) => 
                `${this.dataService.getSpeciesInfo(species).name}: ${catch_val.toFixed(1)}t`
            );
        
        popupContent.innerHTML = `
            <div class="popup-header">
                <strong>Cell ${lat}°, ${lon}°</strong>
            </div>
            <div class="popup-details">
                <p><strong>Total Catch:</strong> ${cellData.totalCatch.toFixed(1)} tonnes</p>
                <p><strong>Total Sets:</strong> ${cellData.totalSets}</p>
                <p><strong>CPUE:</strong> ${cellData.cpue.toFixed(2)} t/set</p>
                <p><strong>Set Types:</strong> ${Array.from(cellData.setTypes).join(', ')}</p>
                ${topSpecies.length > 0 ? `
                    <p><strong>Top Species:</strong></p>
                    <ul style="margin: 0; padding-left: 1rem;">
                        ${topSpecies.map(species => `<li style="font-size: 0.8rem;">${species}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
        
        this.popup.setPosition(coordinate);
    }
    
    /**
     * Update info panel with cell details
     */
    _updateInfoPanel(cellData, lat, lon) {
        const cellDetailsDiv = document.getElementById('cellDetails');
        if (!cellDetailsDiv) return;
        
        // Get species breakdown
        const speciesBreakdown = Object.entries(cellData.speciesCatch)
            .filter(([species, catch_val]) => catch_val > 0)
            .sort(([,a], [,b]) => b - a)
            .map(([species, catch_val]) => {
                const info = this.dataService.getSpeciesInfo(species);
                return `
                    <div class="detail-row">
                        <span class="detail-label">${info.name}:</span>
                        <span class="detail-value">${catch_val.toFixed(1)}t</span>
                    </div>
                `;
            }).join('');
        
        // Get temporal info
        const years = Array.from(cellData.years).sort();
        const months = Array.from(cellData.months).sort().map(m => 
            this.dataService.getMonthName(m)
        );
        
        cellDetailsDiv.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Coordinates:</span>
                <span class="detail-value">${lat}°, ${lon}°</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Catch:</span>
                <span class="detail-value">${cellData.totalCatch.toFixed(1)} tonnes</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fishing Sets:</span>
                <span class="detail-value">${cellData.totalSets}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">CPUE:</span>
                <span class="detail-value">${cellData.cpue.toFixed(2)} t/set</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Set Types:</span>
                <span class="detail-value">${Array.from(cellData.setTypes).join(', ')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Years:</span>
                <span class="detail-value">${years.join(', ')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Records:</span>
                <span class="detail-value">${cellData.records.length}</span>
            </div>
            ${speciesBreakdown ? `
                <hr style="margin: 0.75rem 0; border: none; border-top: 1px solid var(--border-color);">
                <strong style="font-size: 0.875rem; color: var(--text-primary);">Species Breakdown:</strong>
                ${speciesBreakdown}
            ` : ''}
        `;
    }
    
    /**
     * Update legend based on current metric
     */
    _updateLegend(metric) {
        const legendDiv = document.querySelector('.map-legend');
        if (!legendDiv) return;
        
        const scale = this.colorScales[metric] || this.colorScales.total_catch;
        const metricNames = {
            total_catch: 'Total Catch (tonnes)',
            num_sets: 'Number of Sets',
            cpue: 'CPUE (tonnes/set)',
            yft_catch: 'Yellowfin Catch (tonnes)',
            skj_catch: 'Skipjack Catch (tonnes)'
        };
        
        const legendItems = scale.thresholds.map((threshold, index) => {
            const nextThreshold = scale.thresholds[index + 1];
            const label = nextThreshold ? 
                `${threshold} - ${nextThreshold}` : 
                `${threshold}+`;
            
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${scale.colors[index]};"></div>
                    <span>${label}</span>
                </div>
            `;
        }).join('');
        
        legendDiv.innerHTML = `
            <h4>${metricNames[metric] || 'Intensity'}</h4>
            <div class="legend-scale">
                ${legendItems}
            </div>
        `;
    }
    
    /**
     * Fit map to data bounds
     */
    fitToData() {
        if (this.vectorSource.getFeatures().length === 0) {
            return;
        }
        
        const extent = this.vectorSource.getExtent();
        this.map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000
        });
    }
    
    /**
     * Export map as image
     */
    exportMap() {
        this.map.once('rendercomplete', () => {
            const mapCanvas = document.createElement('canvas');
            const size = this.map.getSize();
            mapCanvas.width = size[0];
            mapCanvas.height = size[1];
            const mapContext = mapCanvas.getContext('2d');
            
            Array.prototype.forEach.call(
                this.map.getViewport().querySelectorAll('.ol-layer canvas'),
                (canvas) => {
                    if (canvas.width > 0) {
                        const opacity = canvas.parentNode.style.opacity;
                        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                        const transform = canvas.style.transform;
                        const matrix = transform
                            .match(/^matrix\(([^\(]*)\)$/)[1]
                            .split(',')
                            .map(Number);
                        CanvasRenderingContext2D.prototype.setTransform.apply(
                            mapContext,
                            matrix
                        );
                        mapContext.drawImage(canvas, 0, 0);
                    }
                }
            );
            
            // Download image
            const link = document.createElement('a');
            link.download = `purse_seine_map_${new Date().toISOString().split('T')[0]}.png`;
            link.href = mapCanvas.toDataURL();
            link.click();
        });
        
        this.map.renderSync();
    }
    
    /**
     * Get map instance
     */
    getMap() {
        return this.map;
    }
    
    /**
     * Resize map (useful for responsive design)
     */
    resize() {
        if (this.map) {
            this.map.updateSize();
        }
    }
    
    /**
     * Clear all features
     */
    clearFeatures() {
        if (this.vectorSource) {
            this.vectorSource.clear();
        }
    }
    
    /**
     * Add bathymetry/oceanographic background (future enhancement)
     */
    addOceanBackground() {
        // This could be enhanced with bathymetry data or other oceanographic layers
        console.log('Ocean background feature available for future enhancement');
    }
    
    /**
     * Get current view extent in geographic coordinates
     */
    getCurrentExtent() {
        const view = this.map.getView();
        const extent = view.calculateExtent(this.map.getSize());
        return ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapService;
}