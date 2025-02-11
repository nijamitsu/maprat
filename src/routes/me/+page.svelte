<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Internal utilities
	import { getSavedCities } from '$lib/utils/storage';
	import { checkUrlParameter } from '$lib/utils/urlStorage';

	// Internal components
	import Map from '$lib/components/Map/Map.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import SavedCities from '$lib/components/CitySearch/SavedCities.svelte';

	let savedCities = $state([]);
	let isInitialized = $state(false);

	onMount(async () => {
		savedCities = await checkUrlParameter('cid');
		if (!savedCities || (Array.isArray(savedCities) && savedCities.length === 0)) {
			goto('/'); // Redirect to home page
			return;
		}
		isInitialized = true;
	});
	
</script>
{#if isInitialized}
	<section class="main-wrapper">
		<Map {savedCities} />
		<ProgressBar {savedCities} />
		<section class="citysearch-savedcities-wrapper">
			<div class="citysearch-savedcities">
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
