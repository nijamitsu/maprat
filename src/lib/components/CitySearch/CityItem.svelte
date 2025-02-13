<script>
	import { page } from '$app/stores';

	let { savedCity, removeCityEvent, children } = $props();

	let isRemoveButtonVisible = $state(false);
	let currentRoute = $page.route.id;

	function clickOutside(node) {
		const handleClick = (event) => {
			if (!node.contains(event.target)) {
				isRemoveButtonVisible = false;
			}
		};

		document.addEventListener('click', handleClick);

		return {
			destroy() {
				document.removeEventListener('click', handleClick);
			}
		};
	}

	function handleItemClick() {
		if (currentRoute !== '/me') { 
			isRemoveButtonVisible = !isRemoveButtonVisible;
		}
	}
</script>

<li class:active={isRemoveButtonVisible} use:clickOutside>
	<article>
		<button class="saved-city-item-button"
		onclick={handleItemClick}
		disabled={currentRoute === '/me'}
		>
			{@render children()}
		</button>
		{#if isRemoveButtonVisible}
			<button class="remove-button" onclick={removeCityEvent} aria-label="Remove {savedCity.name}"
				>&times;</button
			>
		{/if}
	</article>
</li>

<style>
	li {
		height: 50px;
		background-color: #303134;
		border: 1px solid transparent;
		border-radius: var(--border-radius-medium);
		transition:
			box-shadow var(--transition-standard),
			border-color var(--transition-standard);
	}

	article {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
	}

	li.active {
		border-color: var(--color-gray);
	}

	li:hover {
		box-shadow: 0 0 10px 2px rgba(192, 192, 192, 0.2);
	}

	.saved-city-item-button {
		border: none;
		background: none;
		display: flex;
		align-items: center;
		flex: 1;
		height: 100%;
		padding-left: var(--spacing-medium);
	}

	.saved-city-item-button:disabled {
        cursor: default;
    }

	.remove-button {
		width: var(--spacing-large);
		height: var(--spacing-large);
		line-height: var(--spacing-large);
		border-radius: var(--border-radius-large);
		border: none;
		background-color: var(--color-gray);
		font-size: 22px;
		font-family: monospace;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: var(--transition-standard);
		margin-right: var(--spacing-medium);
	}

	.remove-button:hover {
		background-color: #626568;
	}
</style>
