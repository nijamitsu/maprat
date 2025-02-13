<script>
	import { onMount } from 'svelte';

	// Internal utilities
	import { getSavedCities } from '$lib/utils/storage';

	// Internal components
	import Map from '$lib/components/Map/Map.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import WelcomeCopy from '$lib/components/WelcomeCopy.svelte';
	import CitySearch from '$lib/components/CitySearch/CitySearch.svelte';
	import SavedCities from '$lib/components/CitySearch/SavedCities.svelte';

	let savedCities = $state([]);
	let searchTerm = $state('');

	let isInitialized = $state(false);

	onMount(async () => {
		savedCities = getSavedCities();
		isInitialized = true;
	});
</script>

<svelte:head>
	<title>Maprat: Track the countries you've visited and share your travel history</title>
</svelte:head>

{#if isInitialized}
	<section class="main-wrapper">
		<Map {savedCities} />
		<ProgressBar {savedCities} />
		<section class="citysearch-savedcities-wrapper">
			{#if !savedCities.length}
				<WelcomeCopy />
			{/if}
			<div class="citysearch-savedcities">
				<CitySearch bind:savedCities {searchTerm} />
				{#if savedCities.length}
					<SavedCities bind:savedCities />
				{/if}
			</div>
		</section>
	</section>
{/if}

<style>
	.main-wrapper {
		flex: 1;
	}
	.citysearch-savedcities-wrapper {
		max-width: var(--max-width-container);
		margin: 0 auto;
		margin-top: var(--spacing-large);
		padding: 0 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.citysearch-savedcities {
		width: 100%;
		max-width: var(--max-width-element);
		margin-bottom: var(--spacing-large);
	}
</style>
