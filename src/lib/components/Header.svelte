<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	const navLinks = [
		{ path: '/passport', label: 'Passport' },
		{ path: '/visa-faq', label: 'Visa' },
		{ path: '/about', label: 'About' }
	];

	const linkHighlight = (targetRoute) => targetRoute === $page.route.id;

	let isInitialized = $state(false);
	let menuOpen = $state(false);
	let isMobile = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function checkMobile() {
		isMobile = window.innerWidth < 768;
	}

	onMount(() => {
		isInitialized = true;
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});
</script>

{#if isInitialized}
	<section>
		<header>
			<div class="header-text-wrapper">
				<div class="left">
					<a href="/" onclick={menuOpen ? toggleMenu : undefined}>
						<svg
							class="logo"
							width="20"
							height="20"
							viewBox="0 0 160 160"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="127.5" cy="40.5" r="32.5" fill="white" />
							<circle cx="32.5" cy="40.5" r="32.5" fill="white" />
							<circle cx="53" cy="104" r="18" fill="white" />
							<circle cx="106" cy="104" r="18" fill="white" />
							<circle cx="80" cy="143" r="10" fill="white" />
						</svg>

						Maprat</a
					>
				</div>

				{#if isMobile}
					<button
						class="hamburger"
						class:open={menuOpen}
						onclick={toggleMenu}
						aria-label="Toggle menu"
					>
						<svg
							class="hamburger-icon"
							width="20"
							height="20"
							viewBox="0 0 40 40"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect x="5" y="10" width="30" height="3" rx="1.5" fill="currentColor" />
							<rect x="5" y="27" width="30" height="3" rx="1.5" fill="currentColor" />
						</svg>
					</button>
				{:else}
					<div class="right">
						{#each navLinks as link}
							<a href={link.path} class:text-underline={linkHighlight(link.path)}>
								{link.label}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</header>

		{#if isMobile && menuOpen}
			<div class="mobile-menu" transition:slide={{ duration: 300 }}>
				<div class="mobile-menu-links">
					{#each navLinks as link}
						<a
							href={link.path}
							class:text-underline={linkHighlight(link.path)}
							onclick={toggleMenu}
						>
							{link.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</section>
{/if}

<style>
	header {
		padding: 10px;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
	}

	.header-text-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.left a {
		display: flex;
		align-items: center;
		gap: 6px;
		line-height: 1;
	}

	.logo {
		display: inline-flex;
		align-items: center;
	}

	.right {
		display: flex;
		gap: 20px;
	}

	a {
		text-decoration: none;
		text-shadow: 1px 1px 2px var(--color-gray);
	}

	.text-underline {
		text-decoration: underline;
	}

	/* Hamburger menu styles */
	.hamburger {
		padding: 0;
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		z-index: 1001;
	}

	.hamburger-icon {
		transition: transform 0.3s ease-in-out;
	}

	.hamburger-icon rect {
		transition:
			transform 0.3s ease-in-out,
			opacity 0.2s ease-in-out;
		transform-origin: center;
		transform-box: fill-box;
	}

	.hamburger.open rect:nth-child(1) {
		transform: translateY(8.5px) rotate(45deg);
	}

	.hamburger.open rect:nth-child(2) {
		transform: translateY(-8.5px) rotate(-45deg);
	}

	/* Mobile menu styles */
	.mobile-menu {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: var(--color-secondary);
		z-index: 999;
		display: flex;
		flex-direction: column;
		padding-top: 40px;
	}

	.mobile-menu-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 10px;
	}

	.mobile-menu-links a {
		font-size: 24px;
		padding: 10px 0;
	}

	/* logo spin animation */

	/* Ensure each element rotates around its own center */
	svg circle {
		transform-box: fill-box; /* Use the element's own bounding box */
		transform-origin: center; /* Set the origin to the center */
	}

	/* When hovering over the container, animate all circles and the path */
	a:hover .logo circle:nth-child(1) {
		animation: coin-spin 0.8s cubic-bezier(0.2, 0.8, 0.8, 1) 0.2s;
	}
	a:hover .logo circle:nth-child(2) {
		animation: coin-spin 0.8s cubic-bezier(0.2, 0.8, 0.8, 1) 0.3s;
	}
	a:hover .logo circle:nth-child(3) {
		animation: coin-spin 0.8s cubic-bezier(0.2, 0.8, 0.8, 1) 0.4s;
	}
	a:hover .logo circle:nth-child(4) {
		animation: coin-spin 0.8s cubic-bezier(0.2, 0.8, 0.8, 1) 0.5s;
	}
	a:hover .logo circle:nth-child(5) {
		animation: coin-spin 0.8s cubic-bezier(0.2, 0.8, 0.8, 1) 0.6s;
	}

	/* Define the coin spinning animation */
	@keyframes coin-spin {
		0% {
			transform: rotateY(0deg);
		}

		100% {
			transform: rotateY(180deg);
		}
	}
</style>
