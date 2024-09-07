import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/random/summary`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();

		return new Response(JSON.stringify(data), {
			headers: {
				'content-type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching Wikipedia article:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch a random Wikipedia article' }), {
			status: 500,
			headers: {
				'content-type': 'application/json'
			}
		});
	}
};
