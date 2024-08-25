import type { RequestHandler } from '../$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
	try {
		const response = await fetch(env.CLOUDFLARE_WORKER_URL);
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
		console.error('Error fetching from Reddit:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch from Reddit' }), {
			status: 500,
			headers: { 'content-type': 'application/json' }
		});
	}
};
