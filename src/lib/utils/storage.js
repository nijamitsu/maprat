import { browser } from '$app/environment';
import { createJsonLoader } from '$lib/utils/createJsonLoader';
import { get } from 'svelte/store';

const DEFAULT_STORAGE_KEY = 'savedCities';
const staticCityData = createJsonLoader('/cities15000.json', [
	'id',
	'name',
	'countryIso',
	'timezone',
	'latitude',
	'longitude',
	'stateCode'
]);

const staticData = createJsonLoader('/countryInfo.json', [
	'ISO',
	'Country',
	'Population',
	'CurrencyName'
]);

/*
 * checks if localStorage tempered in the dev tools
 */

export const generateChecksum = (data) => {
	const str = JSON.stringify(data);
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}

	return Math.abs(hash).toString(36);
};

const isValidChecksum = (data, checksum) => {
	return generateChecksum(data) === checksum;
};
/* */

staticCityData.subscribe(({ data, isLoading, error }) => {
	if (!isLoading && data && !error && browser) {
		validateAndCleanStorage();
	}
});

staticData.subscribe(({ data, isLoading, error }) => {
	if (!isLoading && data && !error && browser) {
		validateAndCleanStorage();
	}
});

const validateAndCleanStorage = () => {
	const rawData = localStorage.getItem(DEFAULT_STORAGE_KEY);
	if (!rawData) return;

	try {
		const storageObject = JSON.parse(rawData);

		// Match the same validation as loadFromLocalStorage
		if (!storageObject || !Array.isArray(storageObject.data)) {
			console.error('Invalid data structure in localStorage');
			localStorage.removeItem(DEFAULT_STORAGE_KEY);
			return;
		}

		if (!isValidChecksum(storageObject.data, storageObject.checksum)) {
			console.warn('Storage data has been manually modified');
			localStorage.removeItem(DEFAULT_STORAGE_KEY);
			return;
		}
	} catch (error) {
		console.error('Error in validateAndCleanStorage:', error);
		localStorage.removeItem(DEFAULT_STORAGE_KEY);
	}
};
const loadFromLocalStorage = (key) => {
	if (!browser) return null;
	try {
		const rawData = localStorage.getItem(key);
		if (!rawData) return null;

		const storageObject = JSON.parse(rawData);

		// Validate structure
		if (!storageObject || !Array.isArray(storageObject.data)) {
			console.error('Invalid data structure in localStorage');
			localStorage.removeItem(key);
			return null;
		}

		// Validate checksum
		if (!isValidChecksum(storageObject.data, storageObject.checksum)) {
			console.warn('Storage data has been manually modified');
			localStorage.removeItem(key); // Remove corrupted data
			return null;
		}

		return storageObject.data;
	} catch (error) {
		console.error(`Error loading from localStorage (${key}):`, error);
		return null;
	}
};

export const getSavedCities = (storageKey = DEFAULT_STORAGE_KEY) => {
    return loadFromLocalStorage(storageKey) || [];
};

export const saveToLocalStorage = (key, data) => {
	if (!browser) return false;
	try {
		const storageObject = {
			data,
			checksum: generateChecksum(data)
		};
		localStorage.setItem(key, JSON.stringify(storageObject));
		return true;
	} catch (error) {
		console.error(`Error saving to localStorage (${key}):`, error);
		return false;
	}
};

export async function saveCity({ name, id, countryIso, coordinates, timezone, stateCode }, options = {}) {
	const { storageKey = DEFAULT_STORAGE_KEY, onSave } = options;

	try {
		if (onSave) return await onSave({ name, id, countryIso, coordinates, timezone, stateCode });

		const cities = loadFromLocalStorage(storageKey) || [];
		if (cities.some((city) => city.id === id)) return false;

		cities.push({ name, id, countryIso, coordinates, timezone, stateCode });
		return saveToLocalStorage(storageKey, cities);
	} catch (error) {
		console.error('Error saving city:', error);
		return false;
	}
}

export async function removeCity({ id }, options = {}) {
	const { storageKey = DEFAULT_STORAGE_KEY, onRemove } = options;

	try {
		if (onRemove) return await onRemove({ id });

		const cities = loadFromLocalStorage(storageKey);
		if (!cities) return false;

		const cityIndex = cities.findIndex((city) => city.id === id);
		if (cityIndex === -1) return false;

		cities.splice(cityIndex, 1);

		if (cities.length === 0) {
			localStorage.removeItem(storageKey);
			return true;
		}

		return saveToLocalStorage(storageKey, cities);
	} catch (error) {
		console.error('Error removing city:', error);
		return false;
	}
}

export async function clearAllSavedCities(options = {}) {
	const { storageKey = DEFAULT_STORAGE_KEY, onClear } = options;

	try {
		if (onClear) return await onClear();
		if (!browser) return false;

		localStorage.removeItem(storageKey);
		validateAndCleanStorage();
		return true;
	} catch (error) {
		console.error('Error clearing cities:', error);
		return false;
	}
}

/*
 * filter cities
 */

export function filterCities(searchTerm, selectedCityIds) {
	const storeValue = get(staticCityData);

	if (!storeValue.data || storeValue.isLoading || storeValue.error) {
		return [];
	}

	if (!searchTerm.trim()) {
		return [];
	}

	const normalizedSearchTerm = normalizeText(searchTerm);

	const filterLogic = (city) => {
		const normalizedCityName = normalizeText(city.name);
		const nameWithoutThe = normalizedCityName.replace(/^the\s+/, '');
		const words = nameWithoutThe.split(' ');

		return normalizedSearchTerm.length <= 1
			? (normalizedCityName.startsWith(normalizedSearchTerm) ||
					nameWithoutThe.startsWith(normalizedSearchTerm)) &&
					!selectedCityIds.includes(city.id)
			: (normalizedCityName.startsWith(normalizedSearchTerm) ||
					nameWithoutThe.startsWith(normalizedSearchTerm) ||
					words.some((word) => word.startsWith(normalizedSearchTerm))) &&
					!selectedCityIds.includes(city.id);
	};

	const sortLogic = (a, b) => {
		const aName = normalizeText(a.name);
		const bName = normalizeText(b.name);

		const aStarts = aName.startsWith(normalizedSearchTerm);
		const bStarts = bName.startsWith(normalizedSearchTerm);

		if (aStarts && !bStarts) return -1;
		if (!aStarts && bStarts) return 1;

		return aName.localeCompare(bName);
	};

	return storeValue.data.filter(filterLogic).sort(sortLogic).slice(0, 7);
}

function normalizeText(text) {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

/* dynamic jsonfilter function. consider using this for filterCities too */
export function filterJsonData(searchTerm, fieldName) {
    const storeValue = get(staticData);
    
    if (!storeValue.data || storeValue.isLoading || storeValue.error) {
        return [];
    }
    
    if (!searchTerm.trim()) {
        return [];
    }
    
    const normalizedSearchTerm = normalizeText(searchTerm);
    
    const filterLogic = (data) => {
        const fieldValue = data[fieldName];
        if (!fieldValue) return false;
        
        const normalizedFieldValue = normalizeText(fieldValue);
        const valueWithoutThe = normalizedFieldValue.replace(/^the\s+/, '');
        const words = valueWithoutThe.split(' ');
        
        return normalizedSearchTerm.length <= 1
            ? (normalizedFieldValue.startsWith(normalizedSearchTerm) ||
               valueWithoutThe.startsWith(normalizedSearchTerm))
            : (normalizedFieldValue.startsWith(normalizedSearchTerm) ||
               valueWithoutThe.startsWith(normalizedSearchTerm) ||
               words.some((word) => word.startsWith(normalizedSearchTerm)));
    };
    
    const sortLogic = (a, b) => {
        const aValue = normalizeText(a[fieldName]);
        const bValue = normalizeText(b[fieldName]);
        
        const aStarts = aValue.startsWith(normalizedSearchTerm);
        const bStarts = bValue.startsWith(normalizedSearchTerm);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return aValue.localeCompare(bValue);
    };
    
    return storeValue.data.filter(filterLogic).sort(sortLogic).slice(0, 7);
}

export function getMatchingData(jsonData, options = {}) {
    if (!jsonData) {
        throw new Error('JSON data not provided');
    }

    const { fieldName, matchValue } = options;

    if (!fieldName) {
        return jsonData;
    }

    const matchingEntry = jsonData.find(entry => entry[fieldName] === matchValue);
    if (!matchingEntry) {
        throw new Error(`No data found for ${fieldName}: ${matchValue}`);
    }

    const resultData = Object.entries(matchingEntry).reduce((acc, [key, value]) => {
        if (key !== fieldName) {
            acc[key] = { value };
        }
        return acc;
    }, {});

    return resultData;
}
