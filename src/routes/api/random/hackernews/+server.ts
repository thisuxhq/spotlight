import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Fetch top stories from Hacker News
		const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
		const topStories = await topStoriesResponse.json();

		// Select a random story ID
		const randomStoryId = topStories[Math.floor(Math.random() * topStories.length)];

		// Fetch the details of the random story
		const storyResponse = await fetch(
			`https://hacker-news.firebaseio.com/v0/item/${randomStoryId}.json`
		);
		const story = await storyResponse.json();

		// Check if the story has a URL (some posts might not have one)
		if (!story.url) {
			throw new Error('Selected story does not have a URL');
		}

		return new Response(
			JSON.stringify({
				title: story.title,
				url: story.url,
				permalink: `https://news.ycombinator.com/item?id=${story.id}`
			}),
			{
				headers: {
					'content-type': 'application/json'
				}
			}
		);
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
