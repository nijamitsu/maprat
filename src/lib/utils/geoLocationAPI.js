// geoLocationAPI.js

/**
 * Gets the user's current location using the browser's Geolocation API
 * @returns {Promise} Resolves with {latitude, longitude} or rejects with error
 */
export const getCurrentLocation = () => {
	return new Promise((resolve, reject) => {
		// Check if geolocation is supported
		if (!navigator.geolocation) {
			reject(new Error('Geolocation is not supported by your browser'));
			return;
		}

		// Options for getCurrentPosition
		const options = {
			enableHighAccuracy: true, // Use GPS if available
			timeout: 5000, // Time to wait for response
			maximumAge: 0 // Don't use cached position
		};

		// Get current position
		navigator.geolocation.getCurrentPosition(
			// Success callback
			(position) => {
				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				});
			},
			// Error callback
			(error) => {
				switch (error.code) {
					case error.PERMISSION_DENIED:
						reject(new Error('Location permission denied'));
						break;
					case error.POSITION_UNAVAILABLE:
						reject(new Error('Location information unavailable'));
						break;
					case error.TIMEOUT:
						reject(new Error('Location request timed out'));
						break;
					default:
						reject(new Error('An unknown error occurred'));
				}
			},
			options
		);
	});
};
