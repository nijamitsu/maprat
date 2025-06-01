<script>
	// Svelte built-ins
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Internal components
	import PassportMap from '$lib/components/PassportMap/PassportMap.svelte';
	import CountrySearch from '$lib/components/CountrySearch/CountrySearch.svelte';
	import SelectedCountry from '$lib/components/CountrySearch/SelectedCountry.svelte';
	import { getMatchingData } from '$lib/utils/storage';

	let { data } = $props();
	const visaMatrixData = data.visaMatrixData;
	const countryInfoData = data.countryInfoData;

	let isInitialized = $state(false);
	let selectedCountries = $state([]);
	let visaRequirementData = $state();
	let countriesParam = $state($page.url.searchParams.get('countries'));

	let combinedVisaRequirementData = $derived(combineVisaRequirementData(visaRequirementData));

	function combineVisaRequirementData(visaDataArray) {
		if (!visaDataArray) return {};
		if (!Array.isArray(visaDataArray)) {
			visaDataArray = [visaDataArray];
		}
		// Define the hierarchy
		const rank = (value) => {
			if (value === 'visa free') return 6;
			if (value === -1) return 0;
			if (typeof value === 'number') return 5;
			if (value === 'eta') return 4;
			if (value === 'visa on arrival') return 3;
			if (value === 'e-visa') return 2;
			if (value === 'visa required') return 1;
			return 0;
		};

		// Get union of all keys
		let combined = {};
		visaDataArray.forEach((dataObj) => {
			Object.keys(dataObj).forEach((key) => {
				if (!combined[key]) {
					combined[key] = [];
				}
				combined[key].push(dataObj[key].value);
			});
		});

		// Create the combined visa requirement object.
		const combinedVisaRequirementData = {};
		Object.entries(combined).forEach(([iso, values]) => {
			// Determine the best value based on the ranking.
			let bestValue;
			if (values.includes(-1)) {
				bestValue = -1;
			} else {
				bestValue = values.reduce((prev, curr) => (rank(curr) > rank(prev) ? curr : prev));
			}
			combinedVisaRequirementData[iso] = { value: bestValue };
		});
		return combinedVisaRequirementData;
	}

	function updateUrl() {
		if (selectedCountries.length) {
			const countryCodes = selectedCountries.map((country) => country.ISO);
			goto(`/passport?countries=${countryCodes.join('-')}`, {
				replaceState: true,
				noScroll: true
			});
		} else {
			goto('/passport', {
				replaceState: true,
				noScroll: true
			});
		}
	}

	function updateSelectedCountries() {
		if (countriesParam) {
			const countryISOCodes = countriesParam.split('-');

			// Remove duplicates using Set
			const uniqueISOCodes = [...new Set(countryISOCodes)];

			// Limit to maximum of 5 countries.
			const limitedCountryCodes = uniqueISOCodes.slice(0, 5);

			// Validate ISO codes and map to the required structure.
			selectedCountries = limitedCountryCodes
				.filter((code) => /^[A-Z]{2}$/.test(code) && countryInfoData[code])
				.map((code) => ({
					ISO: code,
					Country: countryInfoData[code].Country,
					Population: countryInfoData[code].Population
				}));
		}
	}

	$effect(() => {
		if (!selectedCountries.length) {
			visaRequirementData = undefined;
			return;
		}

		visaRequirementData = selectedCountries.map((country) =>
			getMatchingData(visaMatrixData, {
				fieldName: 'Passport',
				matchValue: country.ISO
			})
		);
	});

	$effect(() => {
		if (isInitialized) {
			updateUrl();
		}
	});

	onMount(() => {
		updateSelectedCountries();
		isInitialized = true;
	});
</script>

<svelte:head>
	<title>Find out if your passport needs a visa for any destination - Maprat</title>
	<meta name="description" content="Check visa requirements for any destination based on your passport. Maprat makes it easy to plan your travels with up-to-date visa information.">

</svelte:head>

{#if isInitialized}
	<section class="main-wrapper">
		<PassportMap {selectedCountries} {combinedVisaRequirementData} />
		<div class="divider"></div>
		<section class="main-container">
			{#if !selectedCountries.length}
				<div class="welcome-copy">
					<h1>Explore visa requirements for your passport on the map.</h1>
				</div>
			{/if}
			<div class="countrysearch-savedcountry">
				<CountrySearch bind:selectedCountries />

				{#if selectedCountries.length}
					<SelectedCountry
						bind:selectedCountries
						{countryInfoData}
						{visaRequirementData}
						{combinedVisaRequirementData}
					/>
				{/if}
			</div>
		</section>
	</section>
{/if}

<style>
	.main-wrapper {
		flex: 1;
	}

	.main-container {
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

	.countrysearch-savedcountry {
		width: 100%;
		max-width: var(--max-width-element);
		margin-bottom: var(--spacing-large);
		color: var(--color-primary);
	}

	.welcome-copy {
		margin-bottom: var(--spacing-large);
	}

	.welcome-copy h1 {
		font-size: clamp(1rem, 2vw + 1rem, var(--font-size-large));
		color: var(--color-primary);
	}

	.divider {
		width: 100%;
		height: 1px;
		background-color: #1f1f20;
	}
</style>
