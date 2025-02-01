import { browser } from '$app/environment';
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

export function checkUrlParameter(parameter) {
    if (browser) {
        const parameterValue = getUrlParameter(parameter);
        if (parameterValue) {
            const savedCities = getSavedCities();

            if (!savedCities || savedCities.length === 0) {
                const cid = parseUrlParameter(parameter);
                filterCitiesById(cid)
                    .then(filteredCities => {
                        console.log(filteredCities);
                        // Additional logic to handle filtered cities
                    })
                    .catch(error => {
                        console.error('Error filtering cities:', error);
                    });
            }
        }
    }
}

const filterCitiesById = async (cityIds) => {
    return new Promise((resolve, reject) => {
        staticCityData.subscribe((data) => {
            if (data && Array.isArray(data)) {
                const filteredCities = data.filter(city => cityIds.includes(city.id));
                resolve(filteredCities);
            } else {
                reject(new Error('City data is not available or not an array'));
            }
        });
    });
};

const getUrlParameter = (parameter) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
};

const parseUrlParameter = (parameter) => {  
    const cityIds = getUrlParameter(parameter);
    return cityIds ? cityIds.split('-').map(id => parseInt(id, 10)) : [];
}