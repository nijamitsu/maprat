<script>
	// Svelte built-ins
	import { onMount } from 'svelte';

	// Internal components
	import PassportMap from '$lib/components/Map/PassportMap/PassportMap.svelte';
	import CountrySearch from '$lib/components/CountrySearch/CountrySearch.svelte';

	let isInitialized = $state(false);
	let selectedCountryIso = $state('');

	onMount(async () => {
		isInitialized = true;
	});

</script>

<svelte:head>
	<title>Find out if your passport needs a visa for any destination - Maprat</title>
</svelte:head>

{#if isInitialized}
	<section class="main-wrapper">
		<PassportMap {selectedCountryIso} />
		<section class="main-container">
			{#if !selectedCountryIso.length}
				<div class="welcome-copy">
					<h1>Explore visa requirements for your passport on the map.</h1>
				</div>
			{/if}
			<div class="countrysearch-savedcountry">
				<CountrySearch bind:selectedCountryIso />
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
		margin-top: 2rem;
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
</style>
