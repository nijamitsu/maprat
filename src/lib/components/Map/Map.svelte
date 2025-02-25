<script>
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { GetVisitedUniqueCountriesISOs } from '$lib/utils/travelUtils';
	import MapManager from './Map';
	import SavedCities from '../CitySearch/SavedCities.svelte';

	let mapContainer;
	let mapManager = $state();
	let { savedCities = $bindable() } = $props();
	let projectionType = $state('globe');

	function toggleProjection() {
		projectionType = projectionType === 'globe' ? 'mercator' : 'globe';
		mapManager.map.setProjection({ type: projectionType });
	}

	function handleCityAddOnClick(newCity) {
		savedCities = [...savedCities, newCity];
	}

	$effect(() => {
		if (mapManager && savedCities) {
			mapManager.savedCitiesUpdated(savedCities);
		}
	});

	onMount(async () => {
		if (savedCities) {
			mapManager = new MapManager();
			await mapManager.init(mapContainer, savedCities, handleCityAddOnClick);
			await mapManager.initializeCountryBorders(savedCities);

			mapManager.map.on('click', (event) => {
				mapManager.handleMapClick(event, savedCities, handleCityAddOnClick);
			});
		}
	});
</script>

<div class="map-wrapper">
	<div
		bind:this={mapContainer}
		id="map"
		role="application"
		aria-label="Interactive map showing visited locations"
	></div>
	<button class="project-button" onclick={toggleProjection} aria-label="Toggle map projection"
		>{projectionType === 'globe' ? '2D' : '3D'}</button
	>
</div>

<style>
	.map-wrapper {
		position: relative;
		width: 100%;
		height: 400px;
	}

	#map {
		height: 100%;
		width: 100%;
	}

	.project-button {
		display: block;
		position: absolute;
		bottom: 10px;
		left: 10px;
		padding: 7px 8px;
		border: none;
		border-radius: var(--border-radius-medium);
		font-size: var(--font-size-small);
		font-weight: bold;
		font-family: var(--font-family-secondary);
		background-color: var(--color-gray);
		transition: all var(--transition-standard);
	}
	.project-button:hover {
		background-color: #626568;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}

	:global(html, body) {
		height: 100%;
	}

	:global(.maplibregl-ctrl-geolocate, .maplibregl-ctrl-group) {
		border-radius: var(--border-radius-medium) !important;
		padding: 2px !important;
	}

	:global(.maplibregl-popup-tip) {
		border-color: transparent;
	}

	:global(.maplibregl-popup-anchor-top .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-top-left .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-top-right .maplibregl-popup-tip) {
		border-bottom-color: #303134;
	}

	:global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip) {
		border-top-color: #303134;
	}

	:global(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
		border-left-color: #303134;
	}

	:global(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
		border-right-color: #303134;
	}

	:global(.maplibregl-popup-content) {
		background-color: #303134;
		font-family: var(--font-family-primary);
		font-size: var(--font-size-medium);
		padding: var(--spacing-medium);
		border-radius: var(--border-radius-medium);
	}

	:global(.popup-div span) {
		font-weight: bold;
	}

	:global(.popup-button) {
		background-color: transparent;
		border: 0;
		padding: 0;
	}

	:global(.popup-button:hover) {
		text-decoration: underline;
	}
</style>
