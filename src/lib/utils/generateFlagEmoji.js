export function generateFlagEmoji(countryCode) {
	if (!countryCode) {
		console.warn('Invalid country ISO code provided to generate flag emoji');
		return '🏳️';
	}
	try {
		const codePoints = countryCode
			.toUpperCase()
			.split('')
			.map((char) => 127397 + char.charCodeAt());
		return String.fromCodePoint(...codePoints);
	} catch (error) {
		console.warn('Error generating country flag:', error);
		return '🏳️';
	}
}
