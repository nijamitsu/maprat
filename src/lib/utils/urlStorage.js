import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { getSavedCities, saveToLocalStorage, generateChecksum } from './storage';

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
            const meSavedCities = getSavedCities('meSavedCities');

            // if (!meSavedCities || meSavedCities.length === 0) {
                const cid = parseUrlParameter(parameter);

                try {
                    const filteredCities = await filterStaticCities(cid);
                    
                    // Save the filtered cities to localStorage
                    /*if (filteredCities.length > 0) {
                        saveToLocalStorage('meSavedCities', filteredCities);
                    }*/
                    
                    return filteredCities;
                } catch (error) {
                    console.error('Error filtering cities:', error);
                    return [];
                }
            // }
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
    // Wait for staticCityData to load
    const cityDataStore = get(staticCityData);
    
    if (cityDataStore.isLoading) {
        // Wait for data to be loaded
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
            // Transform the city data into the desired format
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