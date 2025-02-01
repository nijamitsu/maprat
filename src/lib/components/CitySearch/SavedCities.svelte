<script>
	// Svelte built-ins
	import { flip } from 'svelte/animate';

	// Internal utilities
	import {
		countVisitedUniqueCountries,
		calculateWorldPercentage,
		calculateTotalDistance,
		formatDistance
	} from '$lib/utils/travelUtils';
	import { removeCity, clearAllSavedCities } from '$lib/utils/storage';
	import { generateFlagEmoji } from '$lib/utils/generateFlagEmoji';

	// Internal components
	import CityItem from './CityItem.svelte';

	let { savedCities = $bindable() } = $props();
	let expandedCountries = $state([]);

	let visitedUniqueCountries = $derived(countVisitedUniqueCountries(savedCities));
	let visitedWorldPercentage = $derived(calculateWorldPercentage(visitedUniqueCountries));
	let totalDistance = $derived(calculateTotalDistance(savedCities));

	async function handleRemoveCity(cityId) {
		const success = await removeCity({ id: cityId });
		if (success) {
			savedCities = savedCities.filter((savedCity) => savedCity.id !== cityId);
		}
	}

	async function handleClearAllCities() {
		const confirmed = window.confirm(
			'Are you sure you want to clear your travel history? This action cannot be undone.'
		);
		if (!confirmed) {
			return;
		}

		const success = await clearAllSavedCities();
		if (success) {
			savedCities = [];
		}
	}

	function toggleCountry(countryIso) {
		if (expandedCountries.includes(countryIso)) {
			expandedCountries = expandedCountries.filter((iso) => iso !== countryIso);
		} else {
			expandedCountries = [...expandedCountries, countryIso];
		}
	}
</script>

<div class="saved-cities-wrapper">
	<div class="percentage-counter">
		<h3>
			You've seen
			{#key visitedWorldPercentage}
				<span class="percentage-wrapper">
					{#each String(visitedWorldPercentage).split('') as digit}
						<span class="digit">{digit}</span>
					{/each}
				</span>
			{/key}% of the world.
		</h3>
		<p>
			{savedCities.length}
			{savedCities.length === 1 ? 'city' : 'cities'},
			{visitedUniqueCountries}
			{visitedUniqueCountries === 1 ? 'country' : 'countries'}
		</p>
		<p>
			{#if totalDistance > 0}
				{formatDistance(totalDistance)} km traveled*
			{/if}
		</p>
	</div>
	<div class="saved-cities-container">
		<div class="saved-cities-list-card">
			<ul class="saved-cities-list">
				{#each Object.entries([...savedCities].reverse().reduce((acc, city) => {
						if (!acc[city.countryIso]) {
							acc[city.countryIso] = [];
						}
						acc[city.countryIso].push(city);
						return acc;
					}, {})) as [countryIso, citiesInCountry] (countryIso)}
					<li class="country-section">
						<p class="country-title">
							{new Intl.DisplayNames(['en'], { type: 'region' }).of(countryIso)}
							{generateFlagEmoji(countryIso)}
							({citiesInCountry.length})
						</p>
						<div class="cityitem-wrapper">
							{#each citiesInCountry.slice(0, expandedCountries.includes(countryIso) ? undefined : 5) as savedCity (savedCity.id)}
								<div animate:flip={{ duration: 300 }}>
									<CityItem {savedCity} removeCityEvent={() => handleRemoveCity(savedCity.id)}>
										{savedCity.name}
									</CityItem>
								</div>
							{/each}
							{#if citiesInCountry.length > 5}
								<div class="see-more-button-wrapper">
									<button class="see-more-button" onclick={() => toggleCountry(countryIso)}>
										{expandedCountries.includes(countryIso) ? 'See less' : 'See all'}
									</button>
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<div class="clear-all-wrapper">
			<button class="clear-all-button" onclick={handleClearAllCities}>Clear all</button>
		</div>
	</div>
	<div>
		<p class="travel-history-notice">
			Currently, your travel history is stored only in your browser. <!-- Save it now to protect your
			adventures. -->
		</p>
	</div>
</div>

<style>
	/* 1. Layout Styles */
	.saved-cities-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: var(--spacing-xl);
		gap: var(--spacing-large);
	}

	.saved-cities-container {
		width: 100%;
	}

	.saved-cities-list {
		display: grid;
		list-style: none;
		gap: var(--spacing-large);
	}

	.cityitem-wrapper {
		display: grid;
		gap: 8px;
	}

	/* 2. Typography & Text Styles */
	.saved-cities-wrapper h3 {
		font-weight: bold;
		font-size: 1.2rem;
	}

	.country-title {
		text-align: left;
	}

	.travel-history-notice {
		text-align: left;
		font-size: var(--font-size-small);
	}

	/* 3. Button Styles */
	.clear-all-wrapper {
		text-align: right;
		padding: 5px 0 0 0;
	}

	.clear-all-button {
		border: none;
		background: none;
		color: var(--color-primary);
	}

	.clear-all-button:hover {
		text-decoration: underline;
	}

	.see-more-button {
		background: none;
		border: none;
		color: var(--color-gray);
		font-size: var(--font-size-medium);
	}

	.see-more-button:hover {
		text-decoration: underline;
	}

	/* 4. Animation Styles */
	.percentage-counter h3 {
		white-space: nowrap;
	}
	.percentage-wrapper {
		display: inline-flex;
		overflow: hidden;
	}

	.digit {
		display: inline-block;
		animation: slotSpin 0.2s ease-out backwards;
		transform-origin: 50% 50%;
	}

	/* 5. Animation Delays */
	.digit:nth-child(1) {
		animation-delay: 0s;
	}
	.digit:nth-child(2) {
		animation-delay: 0.08s;
	}
	.digit:nth-child(3) {
		animation-delay: 0.16s;
	}
	.digit:nth-child(4) {
		animation-delay: 0.2s;
	}

	/* 6. Keyframes */
	@keyframes slotSpin {
		0% {
			transform: translateY(-200%);
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			transform: translateY(0);
		}
	}
</style>
