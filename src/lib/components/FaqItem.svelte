<script>
    import { slide } from 'svelte/transition';

    export let question = "";
    export let answer = "";
    let isOpen = false;

    function toggleAccordion() {
        isOpen = !isOpen;
    }
</script>

<div class="faq-item">
    <button 
        class="question-button" 
        on:click={toggleAccordion}
        aria-expanded={isOpen}
    >
        <span>{question}</span>
        <svg 
            class="arrow" 
            class:rotated={isOpen} 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
        >
            <path d="M6 9l6 6 6-6"/>
        </svg>
    </button>
    
    {#if isOpen}
        <div class="answer" transition:slide>
            <p>{answer}</p>
        </div>
    {/if}
</div>

<style>
    .faq-item {
        width: 100%;
    }

    .question-button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
    }

    .question-button:hover {
        opacity: 0.7;
    }

    .arrow {
        transition: transform var(--transition-standard);
    }

    .rotated {
        transform: rotate(180deg);
    }

    .answer {
        padding: 0 0 1rem 0;
    }
</style>