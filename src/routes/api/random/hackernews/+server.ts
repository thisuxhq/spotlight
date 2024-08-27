import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const response = await fetch(`${env.CLOUDFLARE_WORKER_URL}?source=hackernews`);

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
		console.error('Error fetching Hacker News post:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch a random Hacker News post' }), {
			status: 500,
			headers: {
				'content-type': 'application/json'
			}
		});
	}
};
