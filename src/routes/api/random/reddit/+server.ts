import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
	try {
		const { preferences } = await request.json();
		if (!preferences || preferences.length === 0) {
			throw new Error('No subreddit preferences provided');
		}

		const randomSubreddit = preferences[Math.floor(Math.random() * preferences.length)];
		const response = await fetch(`${env.CLOUDFLARE_WORKER_URL}?source=reddit&subreddit=${randomSubreddit}`);

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
