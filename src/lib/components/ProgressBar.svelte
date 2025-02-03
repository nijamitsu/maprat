<script>
	// Internal utilites
	import { calculateWorldPercentage } from '$lib/utils/travelUtils';

	let { savedCities } = $props();

	// Local states
	let visitedWorldPercentage = $derived(
		calculateWorldPercentage([...new Set(savedCities.map((city) => city.countryIso))].length)
	);

	let rippleEffect = $state(false);

	export function updateProgressBar() {
		rippleEffect = false;
		setTimeout(() => {
			rippleEffect = true;
		}, 0);
	}
</script>

<div class="progress-container">
	<div
		class="progress-bar"
		class:ripple={rippleEffect}
		style="width: {visitedWorldPercentage}%"
	></div>
</div>

<style>
	.progress-container {
		width: 100%;
		height: 1px;
		background-color: #1f1f20;
		overflow: hidden;
		position: relative;
	}

	.progress-bar {
		position: relative;
		width: 0%;
		height: 100%;
		background: var(--gradient-primary);
		background-size: 400% 400%;
		animation: gradientBG 15s ease infinite;
		transition: width var(--transition-slow);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-secondary);
		font-weight: bold;
		font-size: 0.8rem;
	}

	@keyframes gradientBG {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.progress-bar::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		transform: translate(0, -50%);
		opacity: 0;
	}

	.progress-bar.ripple::after {
		animation: ripple 1s ease-out;
	}

	@keyframes ripple {
		0% {
			width: 0;
			height: 0;
			opacity: 0.8;
		}
		100% {
			width: 100%;
			height: 200px;
			opacity: 0;
			transform: translateX(0);
		}
	}
</style>
