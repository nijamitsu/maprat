export function countVisitedUniqueCountries(savedCities) {
	return new Set(savedCities.map((city) => city.countryIso)).size;
}

export function calculateWorldPercentage(count) {
	const TOTAL_COUNTRIES = 195;
	return ((count / TOTAL_COUNTRIES) * 100).toFixed(1);
}
export function GetVisitedUniqueCountriesISOs(savedCities) {
	// Convert savedCities array to array of country codes in reverse order
	const reversedCountries = savedCities.map((city) => city.countryIso).reverse();

	const uniqueCountries = [];
	reversedCountries.forEach((country) => {
		if (!uniqueCountries.includes(country)) {
			uniqueCountries.push(country);
		}
	});

	// Return as Set (will maintain the order we created)
	return new Set(uniqueCountries.reverse());
}

/* traveled distance calculations */
export function calculateTotalDistance(savedCities) {
	if (!savedCities || savedCities.length < 2) return 0;

	let totalDistance = 0;
	for (let i = 1; i < savedCities.length; i++) {
		const prevCity = savedCities[i - 1];
		const currentCity = savedCities[i];

		if (
			!prevCity?.coordinates?.latitude ||
			!prevCity?.coordinates?.longitude ||
			!currentCity?.coordinates?.latitude ||
			!currentCity?.coordinates?.longitude
		) {
			console.warn('Missing coordinates for cities:', prevCity, currentCity);
			continue;
		}

		const lat1 = Number(prevCity.coordinates.latitude);
		const lon1 = Number(prevCity.coordinates.longitude);
		const lat2 = Number(currentCity.coordinates.latitude);
		const lon2 = Number(currentCity.coordinates.longitude);

		if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
			console.warn('Invalid coordinates:', lat1, lon1, lat2, lon2);
			continue;
		}

		totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
	}

	return Math.round(totalDistance);
}
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Earth's radius in kilometers
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function formatDistance(km) {
	return km.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
