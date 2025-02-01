<script>
	import { onMount } from 'svelte';

	// Internal utilities
	import { getSavedCities } from '$lib/utils/storage';

	// Internal components
	import Globe2 from '$lib/components/Globe/Globe2.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import WelcomeCopy from '$lib/components/WelcomeCopy.svelte';
	import CitySearch from '$lib/components/CitySearch/CitySearch.svelte';
	import SavedCities from '$lib/components/CitySearch/SavedCities.svelte';

	let savedCities = $state([]);
	let searchTerm = $state('');

	onMount(async () => {
		savedCities = await getSavedCities();
	});
</script>

<section class="main-wrapper">
	<Globe2 {savedCities} />
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

<style>
	.main-wrapper {
		flex: 1;
	}
	.citysearch-savedcities-wrapper {
		max-width: var(--max-width-container);
		margin: 0 auto;
		margin-top: 2rem;
		padding: 0 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--color-primary);
		justify-content: center;
		text-align: center;
	}

	.citysearch-savedcities {
		width: 100%;
		max-width: var(--max-width-element);
		margin-bottom: var(--spacing-large);
		color: var(--color-primary);
	}
</style>
