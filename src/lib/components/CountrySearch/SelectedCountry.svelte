<script>
	import { createJsonLoader } from '$lib/utils/createJsonLoader';
	import { generateFlagEmoji } from '$lib/utils/generateFlagEmoji';
	import { isTextMatch, sortBySearchMatch, normalizeText } from '$lib/utils/textFilter';

	const VISA_CONFIG = {
		FREE: { type: 'visa free', color: 'text-green' },
		ON_ARRIVAL: { type: 'visa on arrival', color: 'text-blue' },
		ETA: { type: 'eta', color: 'text-blue' },
		E_VISA: { type: 'e-visa', color: 'text-yellow' },
		REQUIRED: { type: 'visa required', color: 'text-red' }
	};

	let {
		selectedCountries = $bindable(),
		visaRequirementData,
		combinedVisaRequirementData,
		countryInfoData
	} = $props();

	let selectedFilter = $state('all');
	let countryFilterText = $state('');

	function isVisaMatch(value, filter) {
		if (filter === 'all') return true;

		switch (filter) {
			case VISA_CONFIG.FREE.type:
				return (
					value === VISA_CONFIG.FREE.type ||
					(typeof value === 'number' && value >= 7 && value <= 360)
				);
			case VISA_CONFIG.ON_ARRIVAL.type:
			case VISA_CONFIG.ETA.type:
				return value === VISA_CONFIG.ON_ARRIVAL.type || value === VISA_CONFIG.ETA.type;
			case VISA_CONFIG.E_VISA.type:
			case VISA_CONFIG.REQUIRED.type:
				return value === filter;
			default:
				return false;
		}
	}

	$effect(() => {
		if (selectedCountries && selectedCountries.length) {
			selectedFilter = 'all';
		}
	});

	const computeVisaCounts = () => {
		const counts = {
			visaFreeCount: 0,
			visaOnArrivalAndEtaCount: 0,
			etaCount: 0,
			eVisaCount: 0,
			visaRequiredCount: 0
		};

		for (const { value } of Object.values(combinedVisaRequirementData || {})) {
			if (
				value === VISA_CONFIG.FREE.type ||
				(typeof value === 'number' && value >= 7 && value <= 360)
			) {
				counts.visaFreeCount++;
			}
			if (value === VISA_CONFIG.ON_ARRIVAL.type || value === VISA_CONFIG.ETA.type) {
				counts.visaOnArrivalAndEtaCount++;
			}
			if (value === VISA_CONFIG.ETA.type) {
				counts.etaCount++;
			}
			if (value === VISA_CONFIG.E_VISA.type) {
				counts.eVisaCount++;
			}
			if (value === VISA_CONFIG.REQUIRED.type) {
				counts.visaRequiredCount++;
			}
		}
		return counts;
	};

	const visaFreeCount = () => computeVisaCounts().visaFreeCount;
	const visaOnArrivalAndEtaCount = () => computeVisaCounts().visaOnArrivalAndEtaCount;
	const etaCount = () => computeVisaCounts().etaCount;
	const eVisaCount = () => computeVisaCounts().eVisaCount;
	const visaRequiredCount = () => computeVisaCounts().visaRequiredCount;

	function getVisaRequirementColorClass(value) {
		if (typeof value === 'number' && value >= 7 && value <= 360) {
			return VISA_CONFIG.FREE.color;
		}
		return Object.values(VISA_CONFIG).find((config) => config.type === value)?.color || '';
	}

	function getVisaText(value) {
		if (value === VISA_CONFIG.FREE.type || (Number.isFinite(value) && value >= 7 && value <= 360)) {
			return VISA_CONFIG.FREE.type;
		}
		if (value === VISA_CONFIG.ON_ARRIVAL.type) {
			return VISA_CONFIG.ON_ARRIVAL.type;
		}
		if (value === VISA_CONFIG.ETA.type) {
			return VISA_CONFIG.ETA.type;
		}
		if (value === VISA_CONFIG.E_VISA.type) {
			return VISA_CONFIG.E_VISA.type;
		}
		if (value === VISA_CONFIG.REQUIRED.type) {
			return VISA_CONFIG.REQUIRED.type;
		}
		return '';
	}

	const filterOptions = [
		{ color: 'green', value: VISA_CONFIG.FREE.type },
		{ color: 'blue', value: VISA_CONFIG.ON_ARRIVAL.type },
		{ color: 'yellow', value: VISA_CONFIG.E_VISA.type },
		{ color: 'red', value: VISA_CONFIG.REQUIRED.type }
	];

	function handleFilterClick(value) {
		selectedFilter = selectedFilter === value ? 'all' : value;
	}

	function handleFilterInput(event) {
		countryFilterText = event.target.value;
	}

	/* country card */

	let activeRemoveCard = $state(null);

	function handleCountryCardButtonClick(country) {
		activeRemoveCard = activeRemoveCard === country.ISO ? null : country.ISO;
	}

	function removeCountryEvent(country) {
		selectedCountries = selectedCountries.filter((c) => c.ISO !== country.ISO);
	}
	/* end of country card */

	function computeMobilityScore(visaData) {
		let score = 0;
		// Iterate over each destination's visa requirement in the country’s visaData
		for (const { value } of Object.values(visaData || {})) {
			if (
				value === VISA_CONFIG.FREE.type ||
				(typeof value === 'number' && value >= 7 && value <= 360)
			) {
				score++;
			}
			if (value === VISA_CONFIG.ON_ARRIVAL.type || value === VISA_CONFIG.ETA.type) {
				score++;
			}
			if (value === VISA_CONFIG.ETA.type) {
				score++;
			}
			if (value === VISA_CONFIG.E_VISA.type) {
				score++;
			}
		}
		return score;
	}

	// Compute filtered visa data based on combinedVisaRequirementData and current filter settings.
	let filteredVisaData = $derived(
		combinedVisaRequirementData
			? Object.entries(combinedVisaRequirementData).filter(
					([countryIso, data]) =>
						data.value !== -1 && isTextMatch(countryIso, countryFilterText, countryInfoData)
				)
			: []
	);

	// New helper: compute counts from filtered visa data.
	function computeFilteredVisaCounts(filteredData) {
		const counts = {
			visaFreeCount: 0,
			visaOnArrivalAndEtaCount: 0,
			etaCount: 0,
			eVisaCount: 0,
			visaRequiredCount: 0
		};
		filteredData.forEach(([countryIso, { value }]) => {
			if (
				value === VISA_CONFIG.FREE.type ||
				(typeof value === 'number' && value >= 7 && value <= 360)
			) {
				counts.visaFreeCount++;
			}
			if (value === VISA_CONFIG.ON_ARRIVAL.type || value === VISA_CONFIG.ETA.type) {
				counts.visaOnArrivalAndEtaCount++;
			}
			if (value === VISA_CONFIG.ETA.type) {
				counts.etaCount++;
			}
			if (value === VISA_CONFIG.E_VISA.type) {
				counts.eVisaCount++;
			}
			if (value === VISA_CONFIG.REQUIRED.type) {
				counts.visaRequiredCount++;
			}
		});
		return counts;
	}

	// Reactive counts based on current filter.
	let filteredCounts = $derived(computeFilteredVisaCounts(filteredVisaData));
</script>

<div class="selected-country-wrapper">
	<div class="selected-country-container">
		{#each [...selectedCountries].reverse() as country, i (country.ISO)}
			<div class="country-card">
				<button
					class="country-card-button"
					onclick={() => handleCountryCardButtonClick(country)}
					aria-pressed={activeRemoveCard === country.ISO}
				>
					<h2 class="selected-country-title">
						{country.Country}
						{generateFlagEmoji(country.ISO)}
					</h2>
					<!-- Calculate mobility score using the individual visa data -->
					{#if visaRequirementData && visaRequirementData.length}
						<div>
							Mobility score: {computeMobilityScore(
								visaRequirementData[selectedCountries.length - 1 - i]
							)}/199
						</div>
					{:else}
						<div>Mobility score: N/A</div>
					{/if}
					<div>
						Population: {country.Population.toLocaleString()}
					</div>
					<div>
						Capital: {country.Capital}
					</div>
					<div>
						Currency: {country.CurrencyName} ({country.CurrencyCode})
					</div>
				</button>
				{#if activeRemoveCard === country.ISO}
					<button
						class="remove-button"
						aria-label="Remove {country.Country}"
						onclick={() => removeCountryEvent(country)}
						>&times;
					</button>
				{/if}
			</div>
		{/each}

		<div class="visa-country-filter">
			<input
				type="search"
				id="visaCountryFilterInput"
				class="visa-country-filter-input"
				placeholder="Filter countries"
				autocorrect="off"
				autocapitalize="off"
				autocomplete="off"
				spellcheck="false"
				aria-label="Filter countries"
				oninput={handleFilterInput}
			/>

			<div class="color-legend-wrapper">
				{#each filterOptions as option, i}
					<button
						class="bg-{option.color} {selectedFilter === option.value ? 'selected' : ''}"
						value={option.value}
						onclick={() => handleFilterClick(option.value)}
					>
						{[
							filteredCounts.visaFreeCount,
							filteredCounts.visaOnArrivalAndEtaCount,
							filteredCounts.eVisaCount,
							filteredCounts.visaRequiredCount
						][i]}
					</button>
				{/each}
			</div>
		</div>

		<div class="selected-country-body">
			<div class="country-visa-info">
				{#if combinedVisaRequirementData}
					{#each sortBySearchMatch(Object.entries(combinedVisaRequirementData), countryFilterText, countryInfoData) as [countryIso, data]}
						{#if data.value !== -1 && isVisaMatch(data.value, selectedFilter) && isTextMatch(countryIso, countryFilterText, countryInfoData)}
							<div class="visa-row">
								<div class="country-name">
									{countryInfoData[countryIso]}
									{generateFlagEmoji(countryIso)}
								</div>
								<div class="visa-requirement {getVisaRequirementColorClass(data.value)}">
									{getVisaText(data.value)}
								</div>
							</div>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* country card */
	.selected-country-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-top: var(--spacing-large);
	}

	.selected-country-container {
		width: 100%;
	}

	.country-card {
		text-align: left;
		position: relative;
	}

	.country-card:not(:first-child) {
		margin-top: var(--spacing-small);
	}

	.country-card-button {
		background-color: #303134;
		border-radius: var(--border-radius-medium);
		padding: var(--spacing-medium);
		width: 100%;
		height: 100%;
		border: 1px solid transparent;
		text-align: left;
	}

	.country-card-button[aria-pressed='true'] {
		border-color: var(--color-gray);
	}

	.country-card-button:hover {
		box-shadow: 0 0 10px 2px rgba(192, 192, 192, 0.2);
	}

	.remove-button {
		position: absolute;
		top: var(--spacing-medium);
		right: var(--spacing-medium);
		width: var(--spacing-large);
		height: var(--spacing-large);
		padding: 0;
		border-radius: var(--border-radius-full);
		border: none;
		background-color: var(--color-gray);
		font-size: 1.25rem;
		font-family: monospace;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: var(--transition-standard);
	}

	.remove-button:hover {
		background-color: #626568;
	}

	h2 {
		font-size: 1.2rem;
	}
	/* end of country card */

	.visa-country-filter {
		margin-top: var(--spacing-medium);
	}

	.visa-country-filter-input {
		width: 100%;
		border: none;
		outline: none;
		margin: 0;
		background-color: var(--color-gray);
		padding: var(--spacing-small) var(--spacing-medium) var(--spacing-small) var(--spacing-medium);
		border-radius: 0;
		border-top-left-radius: var(--border-radius-medium);
		border-top-right-radius: var(--border-radius-medium);
		font-size: var(--font-size-small);
	}

	.selected-country-body {
		margin-top: var(--spacing-medium);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-large);
	}

	.color-legend-wrapper {
		width: 100%;
		height: 35px;
		display: flex;
		flex: 1;
		align-items: center;
	}

	.color-legend-wrapper button {
		height: 100%;
		width: 25%;
		margin: 0;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		opacity: 0.95;
		transition: transform var(--transition-standard);
		font-size: var(--font-size-small);
	}

	.color-legend-wrapper button:first-child {
		border-bottom-left-radius: var(--border-radius-medium);
	}

	.color-legend-wrapper button:last-child {
		border-bottom-right-radius: var(--border-radius-medium);
	}

	.color-legend-wrapper button:hover {
		opacity: 1;
	}

	.color-legend-wrapper button:active {
		opacity: 1;
	}

	.bg-green {
		background-color: var(--color-green);
	}

	.bg-blue {
		background-color: var(--color-blue);
	}

	.bg-yellow {
		background-color: var(--color-yellow);
	}

	.bg-red {
		background-color: var(--color-red);
	}

	.text-green {
		color: var(--color-green);
	}

	.text-blue {
		color: var(--color-blue);
	}

	.text-yellow {
		color: var(--color-yellow);
	}

	.text-red {
		color: var(--color-red);
	}

	.country-visa-info {
		display: grid;
		gap: 8px;
	}

	.visa-row {
		background-color: #303134;
		height: 50px;
		border-radius: var(--border-radius-medium);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-medium);
	}

	.country-name {
		text-align: left;
	}

	.visa-requirement {
		text-align: right;
	}

	.selected {
		opacity: 1 !important;
		transform: scale(1.1);
		transition: transform var(--transition-standard);
		z-index: 1000 !important;
	}

	.visa-country-filter-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		appearance: none;
	}
</style>
