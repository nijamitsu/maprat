import maplibregl from 'maplibre-gl';
import { GetVisitedUniqueCountriesISOs } from '$lib/utils/travelUtils';
import { generateFlagEmoji } from '$lib/utils/generateFlagEmoji';
import { saveCity } from '$lib/utils/storage';

export default class MapManager {
	constructor() {
		this.map = null;
		this.markers = new Map();
		this.isInitialLoad = true;
		this.previousCitiesCount = 0;
		this.geojson_file_path = 'ne_110m_admin_0_countries.json';

		this.config = {
			map: {
				style: 'edited-positron.json',
				zoom: 1,
				minZoom: 0,
				center: [30, 40],
				canvasContextAttributes: { antialias: true }
			},
			marker: {
				scale: 0.6,
				color: '#fc95c5',
				transparency: 0.1,
				opacityWhenCovered: 0.01
			}
		};
	}

	async init(mapContainer, savedCities, onCityAddOnClick) {
		try {
			this.map = new maplibregl.Map({
				container: mapContainer,
				...this.config.map
			});

			this.map.dragRotate.disable();
			this.map.keyboard.disable();
			this.map.touchZoomRotate.disableRotation();
			this.map.touchPitch.disable();

			return new Promise((resolve) => {
				this.map.on('style.load', () => {
					this.map.setProjection({ type: 'globe' });
				});

				this.map.on('load', async () => {
					this.previousCitiesCount = savedCities.length;
					this.isInitialLoad = false;

					// Cache the cities data on map initialization
					try {
						const response = await fetch('cities15000.json');
						if (response.ok) {
							this.citiesData = await response.json();
						} else {
							console.error('Failed to load cities15000.json:', response.statusText);
						}
					} catch (error) {
						console.error('Error fetching cities15000.json:', error);
					}

					resolve(this.map);
				});
			});
		} catch (error) {
			console.error('Failed to initialize map:', error);
			throw error;
		}
	}

	savedCitiesUpdated(savedCities) {
		if (!this.map) return;

		const currentCount = savedCities.length;
		const previousCount = this.previousCitiesCount;

		if (currentCount > previousCount) {
			if (savedCities.length > 0 && !this.isInitialLoad) {
				const lastCity = savedCities.at(-1);
				this.flyToLocation(lastCity.coordinates);
			}
		}

		this.previousCitiesCount = currentCount;
		this.updateMarkers(savedCities);
		this.updateVisitedBorders(savedCities);
	}

	createMarker(city) {
		const marker = new maplibregl.Marker(this.config.marker)
			.setLngLat([city.coordinates.longitude, city.coordinates.latitude])
			.addTo(this.map);

		return marker;
	}

	updateMarkers(savedCities) {
		if (!this.map) return;

		const currentCityIds = new Set(savedCities.map((city) => city.id));

		for (const [cityId, marker] of this.markers.entries()) {
			if (!currentCityIds.has(cityId)) {
				marker.remove();
				this.markers.delete(cityId);
			}
		}

		savedCities.forEach((city) => {
			if (!this.markers.has(city.id)) {
				const marker = this.createMarker(city);
				this.markers.set(city.id, marker);
			}
		});
	}

	clearMarkers() {
		for (const marker of this.markers.values()) {
			marker.remove();
		}
		this.markers.clear();
	}

	async initializeCountryBorders(savedCities) {
		if (!this.map?.isStyleLoaded()) return;

		try {
			const response = await fetch(this.geojson_file_path);
			if (!response.ok) {
				throw new Error(`Failed to load GeoJSON file: ${response.statusText}`);
			}
			const geoJsonData = await response.json();

			this.map.addSource('country-boundaries', {
				type: 'geojson',
				data: geoJsonData
			});

			this.map.addLayer(
				{
					id: 'country-borders',
					type: 'line',
					source: 'country-boundaries',
					paint: {
						'line-color': '#fc95c5',
						'line-width': [
							'interpolate',
							['linear'],
							['zoom'],
							0,
							1, // Thinner lines when zoomed out
							4,
							2 // Fuller width when zoomed in
						]
					},
					filter: [
						'in',
						['get', 'ISO_A2_EH'],
						['literal', Array.from(GetVisitedUniqueCountriesISOs(savedCities))]
					]
				},
				'label_other'
			);
		} catch (error) {
			console.error('Error initializing country borders:', error);
			throw error;
		}
	}

	updateVisitedBorders(savedCities) {
		try {
			if (!this.map.getLayer('country-borders')) {
				this.initializeCountryBorders(savedCities);
				return;
			}

			this.map.setFilter('country-borders', [
				'in',
				['get', 'ISO_A2_EH'],
				['literal', Array.from(GetVisitedUniqueCountriesISOs(savedCities))]
			]);
		} catch (error) {
			console.error('Error updating borders:', error);
		}
	}

	flyToLocation(coordinates) {
		if (!this.map) return;

		this.map.flyTo({
			center: [coordinates.longitude, coordinates.latitude],
			zoom: 8,
			duration: 1500,
			essential: true
		});
	}

	handleMapClick(event, savedCities, onCityAddOnClick) {
		if (!this.map?.isStyleLoaded()) return;

		// Check if the clicked point is over water by querying rendered features
		const waterFeatures = this.map.queryRenderedFeatures(event.point, { layers: ['water'] });
		if (waterFeatures.length > 0) return;

		// If a popup is already open, close it and do nothing else for this click.
		if (this.currentPopup) {
			this.currentPopup.remove();
			this.currentPopup = null;
			return;
		}

		let closestCity = null;
		let minDistance = Infinity;
		let isNearSavedCity = false;

		const { lng, lat } = event.lngLat;
		let popupHTML = '';

		if (this.citiesData && Array.isArray(this.citiesData)) {
			const savedCityIds = new Set(savedCities.map((city) => city.id));

			// Use a simple Euclidean distance calculation
			for (const city of this.citiesData) {
				const dx = lat - city.latitude;
				const dy = lng - city.longitude;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < minDistance) {
					minDistance = distance;
					closestCity = city;
				}
			}

			if (closestCity && savedCityIds.has(closestCity.id)) {
				isNearSavedCity = true;
			}

			if (isNearSavedCity && closestCity) {
				popupHTML = `
				<div class="popup-div">
					<p>${closestCity.name} ${generateFlagEmoji(closestCity.countryIso)} is already in your visited cities.</p>
				</div>
				`;
			} else if (closestCity) {
				popupHTML += `
				<div class="popup-div">  
					<div style="margin-bottom: var(--spacing-small)">
					<p>Add<span> ${closestCity.name} ${generateFlagEmoji(closestCity.countryIso)}</span> to your visited cities?</p>
					</div>
					<div style="text-align: right;">	
					<button class="popup-button popup-button-yes">Yes</button>
					<button class="popup-button popup-button-no" style="margin-left: 8px;">No</button>
					</div>
				</div>
				`;
			}
		}

		// Create and store the popup in an instance variable
		this.currentPopup = new maplibregl.Popup({ closeOnClick: true, closeButton: false })
			.setLngLat([lng, lat])
			.setHTML(popupHTML)
			.addTo(this.map);

		// Attach event listener to the "No" button to close the popup
		const noButton = this.currentPopup.getElement().querySelector('.popup-button-no');
		if (noButton) {
			noButton.addEventListener('click', () => {
				this.currentPopup.remove();
				this.currentPopup = null;
			});
		}

		const yesButton = this.currentPopup.getElement().querySelector('.popup-button-yes');
		if (yesButton) {
			yesButton.addEventListener('click', () => {
				const closestCityData = {
					name: closestCity.name,
					id: closestCity.id,
					countryIso: closestCity.countryIso,
					coordinates: {
						latitude: closestCity.latitude,
						longitude: closestCity.longitude
					},
					stateCode: closestCity.stateCode
				};

				const success = saveCity(closestCityData);
				if (success) {
					onCityAddOnClick(closestCityData);
				}

				this.currentPopup.remove();
				this.currentPopup = null;
			});
		}
	}
}
