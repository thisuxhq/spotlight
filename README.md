# Spotlight

Spotlight is a web application designed to help users discover interesting content from across the internet. It provides a simple interface to fetch random, curated links from Reddit's r/InternetIsBeautiful and Hacker News.

## Features

- Random content retrieval from Reddit and Hacker News
- User-friendly interface with one-click discovery
- Responsive design for both desktop and mobile devices
- Local storage of previously discovered links

## Getting Started

To run Spotlight locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

1. Run the build command:
   ```bash
   bun run build
   ```
2. Preview the production build:
   ```bash
   bun run preview
   ```

## Technology Stack

- Svelte: Front-end framework
- TypeScript: Programming language
- Tailwind CSS: Styling

## API Endpoints

- `/api/random/reddit`: Fetches a random post from r/InternetIsBeautiful
- `/api/random/hackernews`: Fetches a random post from Hacker News top stories

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change or add.

## License

[MIT License](LICENSE)

## Acknowledgements

Developed by ThisUX Design Studio. We aim to bring a touch of serendipity to your internet browsing experience.

For any questions or suggestions, please open an issue on GitHub.
