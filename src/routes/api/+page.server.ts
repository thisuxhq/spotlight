import { json } from '@sveltejs/kit';

export const load = async () => {
	const response = await fetch('https://www.reddit.com/r/InternetIsBeautiful/random.json');
	const data = await response.json();

	const post = data[0].data.children[0].data;

	return json({
		title: post.title,
		url: post.url_overridden_by_dest,
		permalink: `https://www.reddit.com${post.permalink}`
	});
};
