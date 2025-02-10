<script>
    import { createJsonLoader } from '$lib/utils/createJsonLoader';
    import { generateFlagEmoji } from '$lib/utils/generateFlagEmoji';
    import { getMatchingData } from '$lib/utils/storage';

    const VISA_REQUIREMENTS = {
        FREE: 'visa free',
        ON_ARRIVAL: 'visa on arrival',
        ETA: 'eta',
        E_VISA: 'e-visa',
        REQUIRED: 'visa required'
    };

    const visaColorMap = {
        [VISA_REQUIREMENTS.FREE]: 'text-green',
        [VISA_REQUIREMENTS.ON_ARRIVAL]: 'text-blue',
        [VISA_REQUIREMENTS.ETA]: 'text-blue',
        [VISA_REQUIREMENTS.E_VISA]: 'text-yellow',
        [VISA_REQUIREMENTS.REQUIRED]: 'text-red'
    };

    let { selectedCountryData } = $props();
    let visaMatrixData = $state();
    let matchedData = $state();
    let selectedFilter = $state('all');
    let countryInfoData = $state({});

    let hasSelectedCountry = $derived(Boolean(selectedCountryData?.ISO));

    const visaMatrixLoader = createJsonLoader('passport-index-matrix-iso2.json');
    const countryInfoLoader = createJsonLoader('countryInfo.json');

    visaMatrixLoader.subscribe(({ data, error }) => {
        if (error) {
            console.error('Failed to load visa matrix:', error);
            throw error;
        }
        if (data) {
            visaMatrixData = data;
        }
    });

    countryInfoLoader.subscribe(({ data, error }) => {
        if (error) {
            console.error('Failed to load country info:', error);
            throw error;
        }
        if (data) {
            // Create a mapping of ISO codes to country names
            countryInfoData = data.reduce((acc, country) => {
                acc[country.ISO] = country.Country;
                return acc;
            }, {});
        }
    });

    $effect(() => {
        if (visaMatrixData && hasSelectedCountry) {
            matchedData = getMatchingData(visaMatrixData, {
                fieldName: 'Passport',
                matchValue: selectedCountryData.ISO
            });
            selectedFilter = 'all';
        }
    });

    const green = $derived(
        Object.values(matchedData || {})
            .filter(entry => 
                entry.value === "visa free" || 
                (typeof entry.value === 'number' && entry.value >= 7 && entry.value <= 360)
            )
            .length
    );

    const blue = $derived(
        Object.values(matchedData || {})
            .filter(entry =>
                entry.value === "visa on arrival" ||
                entry.value === "eta"
            )
            .length
    );

    const yellow = $derived(
        Object.values(matchedData || {})
            .filter(entry => entry.value === "e-visa")
            .length
    );

    const red = $derived(
        Object.values(matchedData || {})
            .filter(entry => entry.value === "visa required")
            .length
    );

    function getVisaRequirementColorClass(value) {
        if (typeof value === 'number' && value >= 7 && value <= 360) {
            return visaColorMap["visa free"];
        }
        return visaColorMap[value] || '';
    }

    function getVisaText(value) {
        if (value === VISA_REQUIREMENTS.FREE || (Number.isFinite(value) && value >= 7 && value <= 360)) {
            return VISA_REQUIREMENTS.FREE;
        }
        if (value === VISA_REQUIREMENTS.ON_ARRIVAL || value === VISA_REQUIREMENTS.ETA) {
            return 'visa on arrival or eta';
        }
        if (value === VISA_REQUIREMENTS.E_VISA) {
            return VISA_REQUIREMENTS.E_VISA;
        }
        if (value === VISA_REQUIREMENTS.REQUIRED) {
            return VISA_REQUIREMENTS.REQUIRED;
        }
        return '';
    }

function handleFilterClick(value) {
    selectedFilter = selectedFilter === value ? 'all' : value;
}

function isVisaMatch(visaValue, filterValue) {
    if (filterValue === 'all') return true;
    
    switch(filterValue) {
        case 'visa free':
            return visaValue === 'visa free' || 
                   (Number.isFinite(visaValue) && visaValue >= 7 && visaValue <= 360);
        case 'visa on arrival & e-visa':
            return visaValue === 'visa on arrival' || visaValue === 'eta';
        case 'eta':
            return visaValue === 'e-visa';
        case 'visa required':
            return visaValue === 'visa required';
        default:
            return false;
    }
}
</script>

<div class="selected-country-wrapper">
    <div class="selected-country-container">
        <header>
            <h2 class="selected-country-title">
                {selectedCountryData.Country} {generateFlagEmoji(selectedCountryData.ISO)}
            </h2>
            <div>
                Population: {selectedCountryData.Population.toLocaleString()}
            </div>
        </header>
        <div class="color-legend-wrapper">
            {#each ['green', 'blue', 'yellow', 'red'] as color, i}
                <button 
                    class="bg-{color} {selectedFilter === ['visa free', 'visa on arrival & e-visa', 'eta', 'visa required'][i] ? 'selected' : ''}"
                    value={['visa free', 'visa on arrival & e-visa', 'eta', 'visa required'][i]}
                    onclick={() => handleFilterClick(['visa free', 'visa on arrival & e-visa', 'eta', 'visa required'][i])}
                >
                    {[green, blue, yellow, red][i]}
                </button>
            {/each}
        </div>
        <div class="selected-country-body">


                <div class="country-visa-info">
                    {#if matchedData}
                        {#each Object.entries(matchedData) as [countryIso, data]}
                            {#if data.value !== -1 && isVisaMatch(data.value, selectedFilter)}
                                <div class="visa-row">
                                    <div class="country-name">
                                        {countryInfoData[countryIso]} {generateFlagEmoji(countryIso)}
                                    </div>
                                    <div class="visa-requirement {getVisaRequirementColorClass(data.value)}">
                                        {getVisaText(data.value)}
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {/if}
                </div>

        </div>
    </div>
    
</div>

<style>
    .selected-country-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-top: var(--spacing-xl);
	}

    .selected-country-container {
		width: 100%;
	}

    header {
        background-color: #303134;
        border-top-right-radius: var(--border-radius-medium);
        border-top-left-radius: var(--border-radius-medium);
        text-align: left;
        padding: var(--spacing-medium);
    }

    h2 {
        font-size: 1.2rem;
    }

    .selected-country-body {
        margin-top: var(--spacing-medium);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-large);
    }

    .color-legend-wrapper {
        width: 100%;
        display: flex;
        flex: 1;
        align-items: center;
    }

    .color-legend-wrapper button {
        height: 30px;
        width: 25%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        opacity: 0.95;
        transition: transform var(--transition-standard);
    }

    .color-legend-wrapper button:first-child {
        border-bottom-left-radius: var(--border-radius-medium);
    }

    .color-legend-wrapper button:last-child {
        border-bottom-right-radius: var(--border-radius-medium);
    }

    .color-legend-wrapper button:hover {
        opacity: 1;
    }

    .color-legend-wrapper button:active {
        opacity: 1;
    }

    .bg-green {
        background-color: var(--color-green);
    }

    .bg-blue {
        background-color: var(--color-blue);
    }
    
    .bg-yellow {
        background-color: var(--color-yellow);
    }

    .bg-red {
        background-color: var(--color-red);
    }

    .text-green {
        color: var(--color-green) !important;
    }

    .text-blue {
        color: var(--color-blue) !important;
    }

    .text-yellow {
        color: var(--color-yellow) !important;
    }

    .text-red {
        color: var(--color-red) !important;
    }

    .country-visa-info {
        display: grid;
        gap: 8px;
    }

    .visa-row {
        background-color: #303134;
        height: 50px;
        border-radius: var(--border-radius-medium);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-medium);
    }

    .country-name {
        text-align: left;
    }

    .visa-requirement {
        text-align: right;
    }

    .selected {
        opacity: 1 !important;
        transform: scale(1.1);
        transition: transform var(--transition-standard);
        z-index: 1000 !important;
    }
</style>