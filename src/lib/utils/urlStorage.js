import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { saveToLocalStorage, generateChecksum } from './storage';

import { createJsonLoader } from './createJsonLoader';

const staticCityData = createJsonLoader('/cities15000.json', [
    'id',
    'name',
    'countryIso',
    'timezone',
    'latitude',
    'longitude'
]);

export async function checkUrlParameter(parameter) {
    if (browser) {
        if (getUrlParameter(parameter)) {
                const cid = parseUrlParameter(parameter);
                try {
                    return await filterStaticCities(cid);
                } catch (error) {
                    console.error('Error filtering cities:', error);
                    return [];
                }
        }
    }
    return [];
}

const getUrlParameter = (parameter) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
};

const parseUrlParameter = (parameter) => {  
    const cityIds = getUrlParameter(parameter);
    return cityIds ? cityIds.split('-').map(id => parseInt(id, 10)) : [];
}

export async function filterStaticCities(cityIds) {
    const cityDataStore = get(staticCityData);
    
    if (cityDataStore.isLoading) {
        return new Promise((resolve) => {
            const unsubscribe = staticCityData.subscribe(($cityData) => {
                if (!$cityData.isLoading) {
                    unsubscribe();
                    const result = processStaticCities($cityData.data, cityIds);
                    resolve(result);
                }
            });
        });
    } else {
        return processStaticCities(cityDataStore.data, cityIds);
    }
}

function processStaticCities(cities, cityIds) {
    if (!cities || !Array.isArray(cities)) {
        console.warn('Static city data is not available or invalid');
        return [];
    }

    const citiesMap = new Map(cities.map(city => [city.id, city]));
    const filteredCities = [];

    cityIds.forEach(id => {
        const city = citiesMap.get(id);
        if (city) {
            const transformedCity = {
                name: city.name,
                id: city.id,
                countryIso: city.countryIso,
                coordinates: {
                    latitude: city.latitude,
                    longitude: city.longitude
                }
            };
            filteredCities.push(transformedCity);
        } else {
            console.warn(`City with ID ${id} not found in static city data`);
        }
    });

    return filteredCities;
}

export function buildCityShareUrl(cityIds) {
    // Get the current origin and pathname from window.location
    const origin = browser ? window.location.origin : '';
    const pathname = browser ? window.location.pathname : '/me/';
    
    // Convert array of IDs to hyphen-separated string
    const cityIdsString = cityIds.join('-');
    
    // Construct the final URL with the query parameter
    const shareUrl = `${origin}${pathname}?cid=${cityIdsString}`;
    
    return shareUrl;
}