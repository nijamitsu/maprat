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
                <a href="/">Maprat <span>🐀</span></a>
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
