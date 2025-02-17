import maplibregl from 'maplibre-gl';
import { createJsonLoader } from '$lib/utils/createJsonLoader';
import { getMatchingData } from '$lib/utils/storage';

const COLORS = {
	GREEN: '#5bc980',
	YELLOW: '#e9d875',
	BLUE: '#559dd6',
	RED: '#c6335f',
	GRAY: '#808080',
	BLACK: '#000000'
};

const VISA = {
	STATUS: {
		PASSPORT_COUNTRY: 'passport',
		VISA_FREE: 'visa free',
		NUMBER: 'number',
		ETA: 'eta',
		VISA_ON_ARRIVAL: 'visa on arrival',
		E_VISA: 'e-visa',
		VISA_REQUIRED: 'visa required',
		NO_ADMISSION: 'no admission',
		DEFAULT: 'default'
	}
};

VISA.COLORS = {
	[VISA.STATUS.PASSPORT_COUNTRY]: COLORS.GRAY,
	[VISA.STATUS.VISA_FREE]: COLORS.GREEN,
	[VISA.STATUS.NUMBER]: COLORS.GREEN,
	[VISA.STATUS.ETA]: COLORS.BLUE,
	[VISA.STATUS.VISA_ON_ARRIVAL]: COLORS.BLUE,
	[VISA.STATUS.E_VISA]: COLORS.YELLOW,
	[VISA.STATUS.VISA_REQUIRED]: COLORS.RED,
	[VISA.STATUS.NO_ADMISSION]: COLORS.RED,
	[VISA.STATUS.DEFAULT]: COLORS.BLACK
};

// Make the object immutable to prevent accidental modifications
Object.freeze(VISA.STATUS);
Object.freeze(VISA.COLORS);
Object.freeze(VISA);

const VISA_STATUS_COLORS = {
	PASSPORT_COUNTRY: COLORS.GRAY,
	VISA_FREE: COLORS.GREEN,
	NUMBER: COLORS.GREEN,
	eta: COLORS.BLUE,
	'visa on arrival': COLORS.BLUE,
	'e-visa': COLORS.YELLOW,
	'visa required': COLORS.RED,
	'no admission': COLORS.RED,
	default: COLORS.BLACK
};

export default class MapManager {
	constructor() {
		this.map = null;
		this.countriesGeoJSON = null;
		this.visaMatrixData = null;
		this.isInitialized = false;

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

		// Create JSON loaders
		this.geoJsonLoader = createJsonLoader('ne_110m_admin_0_countries.json');
		this.visaMatrixLoader = createJsonLoader('passport-index-matrix-iso2.json');
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
				this.map.setProjection({ type: 'mercator' });
			});

			// Subscribe to GeoJSON loader
			this.geoJsonUnsubscribe = this.geoJsonLoader.subscribe(({ data, error }) => {
				if (error) {
					console.error('Failed to load GeoJSON:', error);
					throw error;
				}
				if (data) {
					this.countriesGeoJSON = data;
				}
			});

			// Subscribe to visa matrix loader
			this.visaMatrixUnsubscribe = this.visaMatrixLoader.subscribe(({ data, error }) => {
				if (error) {
					console.error('Failed to load visa matrix:', error);
					throw error;
				}
				if (data) {
					this.visaMatrixData = data;
				}
			});

			return new Promise((resolve) => {
				this.map.once('load', () => {
					resolve(this.map);
				});
				this.isInitialized = true;
			});
			
		} catch (error) {
			console.error('Failed to initialize map:', error);
			throw error;
		}
	}

	getColorForVisaStatus(status, isPassportCountry = false) {
		if (isPassportCountry) {
			return VISA.COLORS[VISA.STATUS.PASSPORT_COUNTRY];
		}
		if (typeof status === 'number') {
			return VISA.COLORS[VISA.STATUS.NUMBER];
		}
		return VISA.COLORS[status] || VISA.COLORS[VISA.STATUS.DEFAULT];
	}

	async loadCountryPolygons(selectedCountryISO) {
        if (!this.isInitialized) {
            throw new Error('Map not initialized. Call init() first');
        }

        if (!this.map || !this.countriesGeoJSON || !this.visaMatrixData) {
            throw new Error('Required map data not loaded');
        }

        if (!selectedCountryISO) {
            throw new Error('selectedCountryISO code is required');
        }

		try {
			const matchedData = getMatchingData(this.visaMatrixData, {
				fieldName: 'Passport',
				matchValue: selectedCountryISO
			});

			// Clean up existing layers and sources first
			this.removeAllCountryPolygons();

			// Process each country's visa status
			Object.entries(matchedData).forEach(([countryIso, data]) => {
				const sourceId = `${countryIso}-source`;
				const layerId = `${countryIso}-layer`;

				// Find the country feature in GeoJSON
				const countryFeature = this.countriesGeoJSON.features.find(
					(feature) => feature.properties.ISO_A2_EH === countryIso
				);

				if (countryFeature) {
					const fillColor = this.getColorForVisaStatus(data.value, countryIso === selectedCountryISO);

					// Add source for the country
					this.map.addSource(sourceId, {
						type: 'geojson',
						data: {
							type: 'Feature',
							geometry: countryFeature.geometry,
							properties: {
								...countryFeature.properties,
								visaStatus: data.value
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
						'water'
					);
				}
			});
		} catch (error) {
			console.error('Error loading country polygons:', error);
			throw error;
		}
	}

	removeAllCountryPolygons() {
		if (!this.map) {
            console.warn('Map instance not initialized - skipping cleanup');
            return;
        }
		
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

	destroy() {
		if (this.geoJsonUnsubscribe) {
			this.geoJsonUnsubscribe();
		}
		if (this.visaMatrixUnsubscribe) {
			this.visaMatrixUnsubscribe();
		}
	}
}
