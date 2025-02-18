export async function load({ fetch }) {
	const [visaRes, countryRes] = await Promise.all([
		fetch('passport-index-matrix-iso2.json'),
		fetch('countryInfo.json')
	]);

	if (!visaRes.ok || !countryRes.ok) {
		throw new Error('Failed to load data');
	}

	const visaMatrixData = await visaRes.json();
	const countryInfoArr = await countryRes.json();

	const countryInfoData = countryInfoArr.reduce((acc, country) => {
		acc[country.ISO] = country.Country;
		return acc;
	}, {});

	return {
		visaMatrixData,
		countryInfoData
	};
}
