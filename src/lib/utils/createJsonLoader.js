import { readable } from 'svelte/store';
import { fetchWithRetry } from './fetchWithRetry';

export function createJsonLoader(url, keys = null) {
	return readable({ data: null, error: null, isLoading: true }, (set) => {
		const loadData = async () => {
			try {
				const response = await fetchWithRetry(url);
				const jsonData = await response.json();

				// If keys are provided, extract only those fields from each object
				const data = keys
					? Array.isArray(jsonData)
						? jsonData.map((item) => {
								let filteredItem = {};
								keys.forEach((key) => {
									if (key in item) filteredItem[key] = item[key];
								});
								return filteredItem;
							})
						: null
					: jsonData; // If no keys are provided, return the entire jsonData

				set({ data, error: null, isLoading: false });
			} catch (err) {
				set({ data: null, error: err.message, isLoading: false });
			}
		};

		loadData();

		return () => {};
	});
}
