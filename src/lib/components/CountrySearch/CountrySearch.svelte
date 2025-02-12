<script>
	// Internal utilites
	import { generateFlagEmoji } from '$lib/utils/generateFlagEmoji';
	import { setupKeyboardNavigation } from '$lib/utils/keyboardNavigation';
	import { filterJsonData } from '$lib/utils/storage';

	// Internal elements
	import SearchIcon from '$lib/elements/SearchIcon.svelte';

	let { selectedCountryData = $bindable() } = $props();
	let searchTerm = $state('');

	function handleClose() {
		searchTerm = '';
	}

	async function handleCountrySelect(data) {
		selectedCountryData = data;
		searchTerm = '';
	}

	let filteredCountries = $derived(
		searchTerm.trim()
			? filterJsonData(searchTerm, 'Country').filter(
					(country) => country.ISO !== selectedCountryData?.ISO
				)
			: []
	);
</script>

<div class="search-wrapper">
	<form class="search-input-wrapper" action="#">
		<SearchIcon size={15} labelFor="citySearchInput" />
		<input
			type="search"
			id="citySearchInput"
			class="city-search-input"
			class:active={filteredCountries.length}
			bind:value={searchTerm}
			placeholder="Enter your passport country"
			autocorrect="off"
			autocapitalize="off"
			autocomplete="off"
			spellcheck="false"
			aria-label="Search for a country"
		/>
	</form>

	<div
		class="city-suggestion-wrapper"
		use:setupKeyboardNavigation={{
			options: filteredCountries,
			onSelect: handleCountrySelect,
			onClose: handleClose,
			searchInputId: 'citySearchInput',
			optionButtonClass: '.city-item-button'
		}}
	>
		{#if searchTerm.trim()}
			<ul role="listbox" aria-label="City suggestions">
				{#each filteredCountries as data}
					{#if data?.ISO}
						<li>
							<button class="city-item-button" onclick={() => handleCountrySelect(data)}>
								{data.Country}
								{generateFlagEmoji(data.ISO)}
							</button>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.search-wrapper {
		position: relative;
		width: 100%;
	}

	.search-input-wrapper {
		position: relative;
		width: 100%;
	}

	.city-search-input {
		width: 100%;
		padding: 17px 15px 16px 40px;
		background-color: var(--color-gray);
		font-size: var(--font-size-medium);
		border: 1px solid var(--color-gray);
		border-bottom: none;
		border-radius: 26px;
		outline: none;
		line-height: normal;
		transition: all var(--transition-standard);
	}

	.city-search-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
		appearance: none;
	}

	.city-search-input:hover {
		background-color: #626568;
		border-color: transparent;
	}

	.city-search-input::placeholder {
		color: #b5b5b5;
	}

	.city-search-input.active {
		border-radius: 26px 26px 0 0;
		background-color: var(--color-gray);
	}

	.city-search-input:focus {
		box-shadow: 0 0 10px 2px rgba(192, 192, 192, 0.2);
		background-color: var(--color-gray);
	}

	.city-suggestion-wrapper {
		width: 100%;
		overflow-y: auto;
		position: absolute;
		background-color: var(--color-gray);
		color: var(--color-secondary);
		box-shadow: var(--shadow-dropdown);
		border: none;
		border-radius: 0 0 23px 23px;
		z-index: 1000;
		top: 100%;
		text-align: left;
		transition:
			opacity 0.2s ease-in-out,
			transform 0.2s ease-in-out;
		opacity: 0;
		transform: translateY(-10px);
	}

	.city-suggestion-wrapper:not(:empty) {
		opacity: 1;
		transform: translateY(0);
	}

	.city-item-button {
		width: 100%;
		padding: 12px 15px;
		display: flex;
		justify-content: space-between;
		border: none;
		background-color: var(--color-gray);
		align-items: center;
		transition: transform var(--transition-standard);
		text-align: left;
	}

	:global(.city-item-button.highlighted) {
		background-color: #626568;
	}

	.city-item-button:hover {
		background-color: #626568;
	}
</style>
