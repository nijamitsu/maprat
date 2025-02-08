<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Maprat: Track the countries you've visited and share your travel history</title>
	<meta name="description" content="Track the countries and cities you've visited, share your travel history with friends." />

	<!-- Google Fonts for Josefin Sans and Libre Baskerville -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main>
	<Header />
	{@render children?.()}
	<Footer />
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
