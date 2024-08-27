import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
	try {
		const { preferences } = await request.json();
		if (!preferences || preferences.length === 0) {
			return new Response(JSON.stringify({ error: 'No subreddit preferences provided' }), {
				status: 400,
				headers: { 'content-type': 'application/json' }
			});
		}

		const response = await fetch(`${env.CLOUDFLARE_WORKER_URL}?source=reddit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ preferences })
		});

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
