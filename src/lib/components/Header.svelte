<script>
	import { page } from '$app/stores';

	const navLinks = [
		{ path: '/passport', label: 'Passport' },
		{ path: '/visa', label: 'Visa' },
		{ path: '/about', label: 'About' }
	];

	const linkHighlight = (targetRoute) => targetRoute === $page.route.id;
</script>

<section>
	<header>
		<div class="header-text-wrapper">
			<div class="left">
				<a href="/">
					<svg
						class="logo"
						width="18"
						height="18"
						viewBox="0 0 160 160"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="126" cy="45" r="33" fill="white" />
						<circle cx="34" cy="45" r="33" fill="white" />
						<circle cx="53" cy="103" r="18" fill="white" />
						<circle cx="106" cy="103" r="18" fill="white" />
						<path
							d="M90 138C90 143.523 85.5228 148 80 148C74.4772 148 70 143.523 70 138C70 132.477 74.4772 128 80 128C85.5228 128 90 132.477 90 138Z"
							fill="white"
						/>
					</svg>

					Maprat</a
				>
			</div>
			<div class="right">
				{#each navLinks as link}
					<a href={link.path} class:text-underline={linkHighlight(link.path)}>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	</header>
</section>

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
</style>
