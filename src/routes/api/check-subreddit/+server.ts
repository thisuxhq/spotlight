import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
	try {
		const { subreddit } = await request.json();
		const response = await fetch(`${env.CLOUDFLARE_WORKER_URL}?source=reddit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ subreddit })
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
		console.error('Error checking subreddit:', error);
		return new Response(JSON.stringify({ error: 'Failed to check subreddit' }), {
			status: 500,
			headers: { 'content-type': 'application/json' }
		});
	}
};
