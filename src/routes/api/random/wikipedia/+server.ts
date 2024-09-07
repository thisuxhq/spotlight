import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        // Fetch a list of articles related to a specific topic from Wikipedia
        const topic = 'Technology'; // You can change the topic as needed
        const articlesResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${topic}&format=json&origin=*`);
        const articlesData = await articlesResponse.json();
        const articles = articlesData.query.search;

        // Select a random article
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];

        // Fetch the details of the random article
        const articleTitle = randomArticle.title;
        const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`;

        return new Response(
            JSON.stringify({
                title: articleTitle,
                url: articleUrl,
                permalink: articleUrl
            }),
            {
                headers: {
                    'content-type': 'application/json'
                }
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: {
                    'content-type': 'application/json'
                }
            }
        );
    }
};