<div class="save-progress-wrapper">
	<button class="save-progress-button"> Save & share your travel history </button>
</div>

<style>
	.save-progress-button {
		background: var(--gradient-primary);
		background-size: 400% 400%;
		animation: gradientBG 15s ease infinite;
		color: var(--color-primary);
		border: none;
		padding: 0.8rem 1rem;
		cursor: pointer;
		transition: transform var(--transition-standard);
		font-weight: bold;
		border-radius: var(--border-radius-full);
	}

	@keyframes shine {
		0% {
			background-position: -50% 50%;
		}
		100% {
			background-position: 130% 50%;
		}
	}

	.save-progress-wrapper {
		width: 100%;
	}

	.save-progress-button:hover {
		background-image: linear-gradient(
			120deg,
			transparent 0%,
			transparent 40%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 60%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: shine 1s infinite;
	}
</style>
