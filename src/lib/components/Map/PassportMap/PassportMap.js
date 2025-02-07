import maplibregl from 'maplibre-gl';

import { createJsonLoader } from '$lib/utils/createJsonLoader';

export default class MapManager {
	constructor() {
		this.map = null;
		this.geojson_file_path = 'ne_110m_admin_0_countries.json';
		this.countriesGeoJSON = null;
		this.visaStatusColors = {
            'passportCountry': '#A020F0',
            'visa free': '#4CAF50',    // green
            'e-visa': '#2196F3',       // blue
            'visa on arrival': '#2196F3',       // blue
			'eta': '#FFC107', // yellow
            'visa required': 'red', // red
            'number': '#4CAF50',       // green
			'no admission': 'red', // red
            'default': '#000'
        };

		this.config = {
			map: {
				style: '/passport-positron.json',
				zoom: 1,
				minZoom: 0,
				maxZoom: 4,
				center: [30, 40],
				canvasContextAttributes: { antialias: true }
			},
			polygon: {
				fill_opacity: 0.7
			}
		};
	}

	async init(mapContainer) {
		try {
			this.map = new maplibregl.Map({
				container: mapContainer,
				...this.config.map
			});

			this.map.dragRotate.disable();
			this.map.keyboard.disable();
			this.map.touchZoomRotate.disableRotation();
			this.map.touchPitch.disable();

            this.map.on('style.load', () => {
                this.map.setProjection({ type: 'globe' });
            });

			// Load GeoJSON data during initialization
			const response = await fetch(this.geojson_file_path);
			this.countriesGeoJSON = await response.json();

			return new Promise((resolve) => {
                this.map.once('load', () => { // beware this once may create problems
                    resolve(this.map);
                });
            });
		} catch (error) {
			console.error('Failed to initialize map:', error);
			throw error;
		}
	}

    getColorForVisaStatus(status, isPassportCountry = false) {
        if (isPassportCountry) {
            return this.visaStatusColors.passportCountry;
        }
        if (typeof status === 'number') {
            return this.visaStatusColors.number;
        }
        return this.visaStatusColors[status] || this.visaStatusColors.default;
    }

    async loadCountryPolygons(passportIso) {
        if (!this.map || !passportIso || !this.countriesGeoJSON) {
            throw new Error('Required parameters missing');
        }

        try {
            // Load visa matrix data
            const visaMatrixLoader = createJsonLoader('passport-index-matrix-iso2.json');
            const visaMatrixData = await new Promise(resolve => {
                visaMatrixLoader.subscribe(({ data }) => {
                    if (data) resolve(data);
                });
            });

            // Find the passport entry
            const passportEntry = visaMatrixData.find(entry => entry.Passport === passportIso);
            if (!passportEntry) {
                throw new Error(`No visa data found for passport: ${passportIso}`);
            }

            // Process each country's visa status
            Object.entries(passportEntry).forEach(([countryIso, visaStatus]) => {
                if (countryIso === 'Passport') return; // Skip the Passport field

                const sourceId = `${countryIso}-source`;
                
                // Remove existing layers and sources if they exist
                const layerId = `${countryIso}-layer`;
                if (this.map.getLayer(layerId)) {
                    this.map.removeLayer(layerId);
                }
                if (this.map.getSource(sourceId)) {
                    this.map.removeSource(sourceId);
                }

                // Find the country feature in GeoJSON
                const countryFeature = this.countriesGeoJSON.features.find(
                    (feature) => feature.properties.ISO_A2_EH === countryIso
                );

                if (countryFeature) {
                    // Determine the fill color
                    const fillColor = this.getColorForVisaStatus(visaStatus, passportIso === countryIso);

                    // Add source for the country
                    this.map.addSource(sourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: countryFeature.geometry,
                            properties: {
                                ...countryFeature.properties,
                                visaStatus
                            }
                        }
                    });

                    // Add visual layer for the country
                    this.map.addLayer(
                        {
                            id: layerId,
                            type: 'fill',
                            source: sourceId,
                            paint: {
                                'fill-color': fillColor,
                                'fill-opacity': this.config.polygon.fill_opacity
                            }
                        },
                        'water' // Render below water layer
                    );
                }
            });
        } catch (error) {
            console.error('Error loading country polygons:', error);
            throw error;
        }
    }

    removeAllCountryPolygons() {
        const layers = this.map.getStyle().layers;
        const sources = this.map.getStyle().sources;
    
        // Remove all layers
        layers.forEach((layer) => {
            if (layer.id.endsWith('-layer')) {
                this.map.removeLayer(layer.id);
            }
        });
    
        // Remove all sources
        Object.keys(sources).forEach((sourceId) => {
            if (sourceId.endsWith('-source')) {
                this.map.removeSource(sourceId);
            }
        });
    }
}

