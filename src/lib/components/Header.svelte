<section>
<header>

    <div class="header-text-wrapper">
        <div class="left"><a class="rat-home-link" href="/">Maprat</a></div>
        <div class="right">
            <a href="/passport">Passport</a>
            <a href="/about">🐀</a>
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
        color: #fff;
        text-decoration: none;
        transition: opacity var(--transition-standard);
        opacity: 0.8;
    }

    a:hover {
        opacity: 1;
    }

</style>
