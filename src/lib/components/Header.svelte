<script>
	import { page } from '$app/stores';

	const shouldHighlight = (targetRoute) => targetRoute === $page.route.id;
</script>

<section>
	<header>
		<div class="header-text-wrapper">
			<div class="left"><a class="rat-home-link" href="/">Maprat <span>🐀</span></a></div>
			<div class="right">
				<a href="/passport" class:text-underline={shouldHighlight('/passport')}> Passport </a>
				<a href="/about" class:text-underline={shouldHighlight('/about')}> About </a>
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
	}

	.right {
		display: flex;
		gap: 20px;
	}

	a {
		text-decoration: none;
		transition: opacity var(--transition-standard);
		text-shadow: 1px 1px 2px var(--color-gray);
	}

	.text-underline {
		text-decoration: underline;
	}
</style>
