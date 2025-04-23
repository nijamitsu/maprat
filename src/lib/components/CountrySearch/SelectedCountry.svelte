<script>
	import InfoIcon from '$lib/elements/InfoIcon.svelte';

	import { generateFlagEmoji } from '$lib/utils/generateFlagEmoji';
	import { isTextMatch, sortBySearchMatch } from '$lib/utils/textFilter';

	const VISA_CONFIG = {
		PASSPORT: { type: -1, color: 'text-gray' },
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

	/* -------------------- Visa Matching and Counting Explanation -------------------- */
	// Properties helper to centralize visa matching logic.
	function getVisaProperties(value) {
		const props = { category: '', text: '', color: '', mobilityScore: 0 };
		if (value === VISA_CONFIG.PASSPORT.type) {
			props.category = 'passport';
			props.text = 'Passport country';
			props.color = VISA_CONFIG.PASSPORT.color;
			props.mobilityScore = 1;
		} else if (
			value === VISA_CONFIG.FREE.type ||
			(typeof value === 'number' && value >= 7 && value <= 360)
		) {
			props.category = 'visaFree';
			props.text = VISA_CONFIG.FREE.type;
			props.color = VISA_CONFIG.FREE.color;
			props.mobilityScore = 1;
		} else if (value === VISA_CONFIG.ON_ARRIVAL.type) {
			props.category = 'onArrival';
			props.text = VISA_CONFIG.ON_ARRIVAL.type;
			props.color = VISA_CONFIG.ON_ARRIVAL.color;
			props.mobilityScore = 1;
		} else if (value === VISA_CONFIG.ETA.type) {
			props.category = 'eta';
			props.text = VISA_CONFIG.ETA.type;
			props.color = VISA_CONFIG.ETA.color;
			props.mobilityScore = 1;
		} else if (value === VISA_CONFIG.E_VISA.type) {
			props.category = 'eVisa';
			props.text = VISA_CONFIG.E_VISA.type;
			props.color = VISA_CONFIG.E_VISA.color;
			props.mobilityScore = 1;
		} else if (value === VISA_CONFIG.REQUIRED.type) {
			props.category = 'required';
			props.text = VISA_CONFIG.REQUIRED.type;
			props.color = VISA_CONFIG.REQUIRED.color;
			props.mobilityScore = 0;
		}
		return props;
	}

	// Helper function to compute visa counts generically
	function computeVisaCountsGeneric(data, valueAccessor) {
		const counts = {
			visaFreeCount: 0,
			etaCount: 0,
			visaOnArrivalCount: 0,
			eVisaCount: 0,
			visaRequiredCount: 0
		};
		data.forEach((item) => {
			const value = valueAccessor(item);
			const visa = getVisaProperties(value);
			if (visa.category === 'passport' || visa.category === 'visaFree') {
				counts.visaFreeCount++;
			}
			if (visa.category === 'onArrival') {
				counts.visaOnArrivalCount++;
			}
			if (visa.category === 'eta') {
				counts.etaCount++;
			}
			if (visa.category === 'eVisa') {
				counts.eVisaCount++;
			}
			if (visa.category === 'required') {
				counts.visaRequiredCount++;
			}
		});
		return counts;
	}

	// Determines if a given visa requirement value meets the current filter criteria.
	function isVisaMatch(value, filter) {
		if (filter === 'all') return true;
		const visa = getVisaProperties(value);
		switch (filter) {
			case VISA_CONFIG.FREE.type:
				return visa.category === 'visaFree';
			case VISA_CONFIG.ON_ARRIVAL.type:
				return visa.category === 'onArrival' || visa.category === 'eta';
			case VISA_CONFIG.E_VISA.type:
				return visa.category === 'eVisa';
			case VISA_CONFIG.REQUIRED.type:
				return visa.category === 'required';
			default:
				return false;
		}
	}

	$effect(() => {
		if (selectedCountries && selectedCountries.length) {
			selectedFilter = 'all';
		}
	});

	// Computes visa counts for filtered data; assumes filteredData is an array of [countryIso, { value }]
	function computeFilteredVisaCounts(filteredData) {
		// Assuming filteredData is an array of [countryIso, { value }]
		return computeVisaCountsGeneric(filteredData, (item) => item[1].value);
	}

	// Computes overall visa counts; assumes combinedVisaRequirementData is an object with { value } entries.
	const computeVisaCounts = () => {
		// Assuming combinedVisaRequirementData is an object whose values are of shape { value }
		return computeVisaCountsGeneric(
			Object.values(combinedVisaRequirementData || {}),
			(item) => item.value
		);
	};

	/* -------------------- End of Visa Matching and Counting Explanation -------------------- */

	const visaFreeCount = () => computeVisaCounts().visaFreeCount;
	const visaOnArrivalCount = () => computeVisaCounts().visaOnArrivalCount;
	const etaCount = () => computeVisaCounts().etaCount;
	const eVisaCount = () => computeVisaCounts().eVisaCount;
	const visaRequiredCount = () => computeVisaCounts().visaRequiredCount;

	// Refactored helper for color using getVisaProperties.
	function getVisaRequirementColorClass(value) {
		return getVisaProperties(value).color;
	}

	// Refactored helper for display text using getVisaProperties.
	function getVisaText(value) {
		return getVisaProperties(value).text;
	}

	// Update filter options remain unchanged.
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

	/* -------------------- Mobility Score Computation Explanation -------------------- */
	function computeMobilityScore(visaData) {
		let score = 0;
		// Iterate over each destination's visa requirement in the visaData.
		for (const { value } of Object.values(visaData || {})) {
			const visa = getVisaProperties(value);
			score += visa.mobilityScore;
		}
		return score;
	}

	/* -------------------- End of Mobility Score Computation Explanation -------------------- */

	// Compute filtered visa data based on combinedVisaRequirementData and current filter settings.
	let filteredVisaData = $derived(
		combinedVisaRequirementData
			? Object.entries(combinedVisaRequirementData).filter(([countryIso, data]) =>
					isTextMatch(countryInfoData[countryIso].Country, countryFilterText)
				)
			: []
	);

	let filteredCounts = $derived(computeFilteredVisaCounts(filteredVisaData));
</script>

<div class="selected-country-wrapper">
	<div class="selected-country-container">
		{#if selectedCountries.length > 1}
			<div class="visa-requirement-summary">
				<h3>
					With the combination of
					{#each selectedCountries as country}
						{generateFlagEmoji(country.ISO)}&nbsp;
					{/each}passports, you can visit
				</h3>
				<p>
					{computeVisaCounts().visaFreeCount}
					{computeVisaCounts().visaFreeCount > 1 ? 'countries' : 'country'}
					<span class="span-underline">visa free</span>
				</p>
				<p>
					{computeVisaCounts().etaCount + computeVisaCounts().visaOnArrivalCount}
					{computeVisaCounts().etaCount > 1 ? 'countries' : 'country'} with a
					<span class="span-underline">visa on arrival or eta</span>
				</p>
				<p>
					{computeVisaCounts().eVisaCount}
					{computeVisaCounts().eVisaCount > 1 ? 'countries' : 'country'} with an
					<span class="span-underline">e-visa</span>
				</p>
				<p>
					{computeVisaCounts().visaRequiredCount}
					{computeVisaCounts().visaRequiredCount > 1 ? 'countries' : 'country'}
					<span class="span-underline">visa required</span>
				</p>
				<p>
					Combined world reach: {Math.round(
						((computeVisaCounts().visaFreeCount +
							computeVisaCounts().etaCount +
							computeVisaCounts().visaOnArrivalCount +
							computeVisaCounts().eVisaCount) /
							199) *
							100
					)}%
				</p>
			</div>
		{/if}
		<div class="country-card-wrapper {selectedCountries.length > 1 ? 'multiple-cards' : ''}">
			{#each [...selectedCountries].reverse() as country, i (country.ISO)}
				<div class="country-card">
					<button
						class="country-card-button"
						onclick={() => handleCountryCardButtonClick(country)}
						aria-pressed={activeRemoveCard === country.ISO}
					>
						<div class="country-card-content">
							<div class="country-details">
								<h3 class="selected-country-title">
									{country.Country}
									{generateFlagEmoji(country.ISO)}
								</h3>
								{#if visaRequirementData && visaRequirementData.length}
									<div>
										<span class="span-underline"
											>Visa free:</span
										>
										{computeVisaCountsGeneric(
											Object.values(visaRequirementData[selectedCountries.length - 1 - i] || {}),
											(item) => item.value
										).visaFreeCount}
									</div>

									<div>
										<span class="span-underline"
											>Visa on arrival<a href="/visa-faq"><InfoIcon /></a> or eta<a href="/visa-faq"
												><InfoIcon /></a
											>:</span
										>
										{computeVisaCountsGeneric(
											Object.values(visaRequirementData[selectedCountries.length - 1 - i] || {}),
											(item) => item.value
										).visaOnArrivalCount +
											computeVisaCountsGeneric(
												Object.values(visaRequirementData[selectedCountries.length - 1 - i] || {}),
												(item) => item.value
											).etaCount}
									</div>

									<div>
										<span class="span-underline">E-visa<a href="/visa-faq"><InfoIcon /></a>:</span>
										{computeVisaCountsGeneric(
											Object.values(visaRequirementData[selectedCountries.length - 1 - i] || {}),
											(item) => item.value
										).eVisaCount}
									</div>

									<div>
										<span class="span-underline">Visa required:</span>

										{computeVisaCountsGeneric(
											Object.values(visaRequirementData[selectedCountries.length - 1 - i] || {}),
											(item) => item.value
										).visaRequiredCount}
									</div>
									<div>
										World reach: {Math.round(
											((computeVisaCountsGeneric(
												Object.values(visaRequirementData[selectedCountries.length - 1 - i] || {}),
												(item) => item.value
											).visaFreeCount +
												computeVisaCountsGeneric(
													Object.values(
														visaRequirementData[selectedCountries.length - 1 - i] || {}
													),
													(item) => item.value
												).etaCount +
												computeVisaCountsGeneric(
													Object.values(
														visaRequirementData[selectedCountries.length - 1 - i] || {}
													),
													(item) => item.value
												).visaOnArrivalCount +
												computeVisaCountsGeneric(
													Object.values(
														visaRequirementData[selectedCountries.length - 1 - i] || {}
													),
													(item) => item.value
												).eVisaCount) /
												199) *
												100
										)}%
									</div>
								{/if}
								<div>
									Population: {country.Population.toLocaleString()}
								</div>
							</div>

							<div class="passport-image-wrapper">
								<img
									src="/passport-images/{country.ISO}-passport.svg"
									alt="{country.Country} passport"
									onerror={(event) => (event.target.style.display = 'none')}
								/>
							</div>
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
		</div>

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
						><span>
							{[
								filteredCounts.visaFreeCount,
								filteredCounts.visaOnArrivalCount + filteredCounts.etaCount,
								filteredCounts.eVisaCount,
								filteredCounts.visaRequiredCount
							][i]}</span
						><span>{option.color === 'blue' ? 'voa or eta' : option.value}</span>
					</button>
				{/each}
			</div>
		</div>
		<div class="selected-country-body">
			<div class="country-visa-info">
				{#if combinedVisaRequirementData}
					{#each sortBySearchMatch(Object.entries(combinedVisaRequirementData), countryFilterText, (iso) => countryInfoData[iso].Country) as [countryIso, data]}
						{#if isVisaMatch(data.value, selectedFilter) && isTextMatch(countryInfoData[countryIso].Country, countryFilterText)}
							<div class="visa-row">
								<div class="country-name">
									{countryInfoData[countryIso].Country}
									{generateFlagEmoji(countryIso)}
								</div>
								<div class="visa-requirement">
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
	/* -------------------- Country Card -------------------- */
	.selected-country-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-top: var(--spacing-large);
	}

	.selected-country-container {
		width: 100%;
	}

	.country-card-wrapper.multiple-cards {
		margin-top: var(--spacing-large);
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

	.country-card-content {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}

	.country-details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-small);
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

	.passport-image-wrapper {
		width: 100px; /* Any width */
		aspect-ratio: 1.42 / 1; /* Maintains the aspect ratio */
	}
	/* -------------------- Visa Requirement Summary -------------------- */

	.visa-requirement-summary {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-small);
	}

	/* -------------------- Visa Country Filter -------------------- */

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
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0;
		opacity: 0.95;
		transition: transform var(--transition-standard);
		font-size: var(--font-size-small);
	}

	.color-legend-wrapper button span {
		line-height: normal;
	}

	.color-legend-wrapper button:first-child {
		border-bottom-left-radius: var(--border-radius-medium);
	}

	.color-legend-wrapper button:last-child {
		border-bottom-right-radius: var(--border-radius-medium);
	}

	.color-legend-wrapper button:hover,
	.color-legend-wrapper button:active {
		opacity: 1;
	}

	/* -------------------- Selected Country Body and Visa Info -------------------- */
	.selected-country-body {
		margin-top: var(--spacing-medium);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-large);
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

	/* -------------------- Utility Classes -------------------- */

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

	.text-gray {
		color: gray;
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

	.visa-country-filter-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		appearance: none;
	}
</style>
