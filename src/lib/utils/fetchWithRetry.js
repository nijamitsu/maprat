export async function fetchWithRetry(url, maxRetries = 3) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const response = await fetch(url);
			if (response.ok) return response;

			switch (response.status) {
				case 400:
					throw new Error('Bad request - please check your input');
				case 401:
					throw new Error('Unauthorized - please login first');
				case 404:
					throw new Error('Country information not found');
				default:
					throw new Error(`HTTP error! status: ${response.status}`);
			}
		} catch (err) {
			if (i === maxRetries - 1) throw err;
			await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
		}
	}
}
