<script>
	// Svelte built-ins
	import { onMount } from 'svelte';

	// Component utilites
	import MapManager from './PassportMap';

	// External utilites
	import 'maplibre-gl/dist/maplibre-gl.css';

	let mapContainer;
	let mapManager = $state();
	let projectionType = $state('globe');

	let { selectedCountryData } = $props();

	function toggleProjection() {
		projectionType = projectionType === 'globe' ? 'mercator' : 'globe';
		if (mapManager && mapManager.map) {
			mapManager.map.setProjection({ type: projectionType });
		}
	}

	$effect(() => {
		if (mapManager && mapManager.map && selectedCountryData.ISO) {
			mapManager.removeAllCountryPolygons();
			mapManager.loadCountryPolygons(selectedCountryData.ISO);
		}
	});

	onMount(async () => {
		mapManager = new MapManager();
		await mapManager.init(mapContainer);
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
		color: var(--color-primary);
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
</style>
