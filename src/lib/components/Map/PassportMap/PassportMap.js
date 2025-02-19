import maplibregl from 'maplibre-gl';
import { createJsonLoader } from '$lib/utils/createJsonLoader';

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
		PASSPORT_COUNTRY: -1,
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
		this.countryFeaturesMap = {}; // Pre-built lookup for country features by ISO
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

		// Create a JSON loader for fetching GeoJSON data
		this.geoJsonLoader = createJsonLoader('ne_110m_admin_0_countries.json');
	}

	async init(mapContainer) {
		try {
			this.map = new maplibregl.Map({
				container: mapContainer,
				...this.config.map
			});

			// Disable unnecessary interactions
			this.map.dragRotate.disable();
			this.map.keyboard.disable();
			this.map.touchZoomRotate.disableRotation();
			this.map.touchPitch.disable();

			// Set projection when style is loaded
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
					// Build a lookup map for country features by ISO code for quick access
					this.countryFeaturesMap = data.features.reduce((acc, feature) => {
						const iso = feature.properties.ISO_A2_EH;
						acc[iso] = feature;
						return acc;
					}, {});
				}
			});

			// Wait until the map is fully loaded
			await new Promise((resolve) => {
				this.map.once('load', () => {
					this.isInitialized = true;
					resolve(this.map);
				});
			});
			return this.map;
		} catch (error) {
			console.error('Failed to initialize map:', error);
			throw error;
		}
	}

	getColorForVisaStatus(value, isSelected) {
		// Force passport country (-1) to always use gray regardless of selection.
		if (value === VISA.STATUS.PASSPORT_COUNTRY) {
			return VISA.COLORS[VISA.STATUS.PASSPORT_COUNTRY];
		}
		// If value is any other number, return the generic number color.
		if (typeof value === 'number') {
			return VISA.COLORS[VISA.STATUS.NUMBER];
		}
		return VISA.COLORS[value] || VISA.COLORS[VISA.STATUS.DEFAULT];
	}

	async loadCountryPolygons(combinedVisaRequirementData) {
		if (!this.isInitialized) {
			throw new Error('Map not initialized. Call init() first');
		}
		if (!this.map || !this.countriesGeoJSON) {
			throw new Error('Required map data not loaded');
		}
		if (!combinedVisaRequirementData) {
			throw new Error('Combined visa requirement data is required');
		}

		try {
			// Clean up existing layers and sources first
			this.removeAllCountryPolygons();

			// Process each country's visa status from combinedVisaRequirementData
			Object.entries(combinedVisaRequirementData).forEach(([countryIso, data]) => {
				const sourceId = `${countryIso}-source`;
				const layerId = `${countryIso}-layer`;

				// Retrieve the country feature using the lookup map for constant-time access
				const countryFeature = this.countryFeaturesMap[countryIso];

				if (countryFeature) {
					// Using false for isSelected; adjust as needed
					const fillColor = this.getColorForVisaStatus(data.value, false);

					// Add source for the country feature to the map
					this.map.addSource(sourceId, {
						type: 'geojson',
						data: {
							type: 'Feature',
							geometry: countryFeature.geometry,
							properties: { ...countryFeature.properties, visaStatus: data.value }
						}
					});

					// Add visual layer for the country polygon
					this.map.addLayer(
						{
							id: layerId,
							type: 'fill',
							source: sourceId,
							paint: { 'fill-color': fillColor, 'fill-opacity': this.config.polygon.fill_opacity }
						},
						'water'
					);
				}
			});
		} catch (error) {
			console.error('Failed to load country polygons', error);
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

		// Remove all layers that match the country polygons naming convention
		layers.forEach((layer) => {
			if (layer.id.endsWith('-layer')) {
				this.map.removeLayer(layer.id);
			}
		});

		// Remove all sources that match the country polygons naming convention
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
		if (this.map) {
			// Remove all registered event listeners
			this.map.off('style.load');
			this.map.off('load');
			// Clean up the map instance
			this.map.remove();
		}
	}
}
