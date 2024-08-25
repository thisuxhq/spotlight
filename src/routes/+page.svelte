<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let state: 'idle' | 'loading' | 'fetched' | 'redirecting' = 'idle';
	let url: string | null = null;
	let title: string | null = null;
	let source: 'reddit' | 'hackernews' | null = null;
	let error: string | null = null;
	let history: Array<{ url: string; title: string; source: 'reddit' | 'hackernews' }> = [];

	function getStoredData() {
		const storedHistory = JSON.parse(localStorage.getItem('urlHistory') || '[]');
		return { history: storedHistory };
	}

	function setStoredData(newItem: { url: string; title: string; source: 'reddit' | 'hackernews' }) {
		const updatedHistory = [newItem, ...history.filter((item) => item.url !== newItem.url)];
		localStorage.setItem('urlHistory', JSON.stringify(updatedHistory));
		history = updatedHistory;
	}

	async function fetchRandomPost(source: 'reddit' | 'hackernews') {
		state = 'loading';
		error = null; // Reset error at the start of the function
		try {
			const response = await fetch(`/api/random/${source}`);
			if (!response.ok) {
				if (response.status === 500) {
					throw new Error(`Server error. The ${source} API might be unavailable.`);
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			console.log('API response:', data);
			if (data.url) {
				url = data.url;
				title = data.title || null;
				setStoredData({
					url: data.url,
					title: data.title || '',
					source: source
				});
				state = 'fetched';
			} else {
				throw new Error(`No valid URL found in the ${source} response`);
			}
		} catch (err) {
			error = `Error fetching from ${source}: ${err.message}`;
			state = 'idle';
			console.error('Error fetching random post:', err);
		}
	}

	function redirectToUrl() {
		if (url) {
			state = 'redirecting';
			setTimeout(() => {
				if (url) {
					window.location.href = url;
				}
			}, 2000);
		}
	}

	let buttonScale = spring(1);
	function pulse() {
		buttonScale.set(1.05);
		setTimeout(() => buttonScale.set(1), 150);
	}

	onMount(() => {
		const { history: storedHistory } = getStoredData();
		history = storedHistory;
	});
</script>

<svelte:head>
	<title>Spotlight - Discover Cool Internet Gems</title>
	<meta
		name="description"
		content="Find random, interesting content from Reddit and Hacker News with just one click."
	/>
	<meta
		name="keywords"
		content="random content, internet discovery, Reddit, Hacker News, cool websites"
	/>
	<meta property="og:title" content="Spotlight - Discover Cool Internet Gems" />
	<meta
		property="og:description"
		content="Click a button, find random, interesting content from Reddit and Hacker News with just one click."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://spotlight.thisux.com" />
	<meta property="og:image" content="https://spotlight.thisux.com/og-image.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Spotlight - Discover Cool Internet Gems" />
	<meta
		name="twitter:description"
		content="Click a button, find something awesome on the internet. Curated content from Reddit and Hacker News."
	/>
	<meta name="twitter:image" content="https://spotlight.thisux.com/twitter-image.jpg" />
</svelte:head>

<div class="min-h-screen bg-black text-gray-300 flex flex-col">
	<main class="flex-grow flex flex-col items-center justify-center p-4">
		<div class="w-full max-w-2xl mx-auto">
			<h1
				in:scale={{ duration: 600, easing: cubicOut }}
				class="text-4xl font-medium tracking-tight mb-4 text-center gradient-text"
			>
				Hey, wanna find something cool?
			</h1>
			<p in:fade={{ delay: 300, duration: 400 }} class="text-xl text-gray-400 mb-10 text-center">
				Hit one of these buttons to find something cool!
			</p>

			{#if state === 'idle'}
				<div
					in:fade={{ duration: 300 }}
					class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
				>
					<button
						on:click={() => {
							pulse();
							fetchRandomPost('reddit');
						}}
						class="big-button bg-red-600 hover:bg-red-700"
						style="transform: scale({$buttonScale})"
					>
						Reddit Surprise
					</button>
					<button
						on:click={() => {
							pulse();
							fetchRandomPost('hackernews');
						}}
						class="big-button bg-orange-600 hover:bg-orange-700"
						style="transform: scale({$buttonScale})"
					>
						HN Surprise
					</button>
				</div>
			{:else if state === 'loading'}
				<div in:fade={{ duration: 300 }} class="text-center">
					<div class="loader"></div>
					<p class="text-lg text-gray-400 mt-4">Hang tight, fishing for gold...</p>
				</div>
			{:else if state === 'fetched'}
				<div
					in:fly={{ y: 20, duration: 400 }}
					class="text-center bg-gray-950 rounded-3xl border border-gray-900 p-6 shadow-lg"
				>
					<p class="text-xl text-gray-300 mb-4">Ta-da! Check this out:</p>
					{#if error}
						<p class="text-red-400 mb-4">{error}</p>
					{:else}
						<p class="text-lg text-gray-400 mb-2">{title}</p>
						<a href={url} class="text-blue-400 hover:text-blue-300 break-all mb-6 block">{url}</a>
					{/if}
					<div
						class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6"
					>
						<button
							on:click={() => {
								pulse();
								redirectToUrl();
							}}
							class="big-button bg-green-600 hover:bg-green-700"
							style="transform: scale({$buttonScale})"
						>
							Let's Go!
						</button>
						<button
							on:click={() => {
								pulse();
								fetchRandomPost(source);
							}}
							class="big-button bg-gray-700 hover:bg-gray-600 text-gray-200"
							style="transform: scale({$buttonScale})"
						>
							One More!
						</button>
					</div>
				</div>
			{:else if state === 'redirecting'}
				<div in:fly={{ y: 20, duration: 300 }} class="text-center">
					<p class="text-xl text-gray-300 mb-2">Buckle up, we're taking off!</p>
					<a href={url} class="text-blue-400 hover:text-blue-300 break-all text-lg">{url}</a>
				</div>
			{/if}

			{#if history.length > 0}
				<div class="mt-16" in:fade={{ duration: 400, delay: 200 }}>
					<h2 class="text-2xl font-semibold text-gray-300 mb-6">Your Cool Finds</h2>
					<div class="grid gap-4 md:grid-cols-2">
						{#each history as item, i}
							<a
								href={item.url}
								class="bg-gray-950 p-4 border-[0.10px] border-gray-900 rounded-2xl hover:shadow-md transition-all duration-300 transform hover:scale-105"
								in:fly={{ y: 20, duration: 300, delay: i * 50 }}
							>
								<p class="text-sm text-gray-500 mb-2">
									{item.source === 'reddit' ? 'Reddit' : 'Hacker News'}
								</p>
								<p class="text-blue-400 hover:text-blue-300 break-all">{item.title || item.url}</p>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</main>

	<footer
		in:fade={{ duration: 300, delay: 500 }}
		class="mt-auto py-4 text-center text-gray-500 text-sm border-t border-gray-800"
	>
		<div class="w-full max-w-2xl mx-auto">
			<p>
				Cooked up with love by
				<a href="https://thisux.com" class="text-gray-400 hover:text-gray-300">
					ThisUX Design Studio.
				</a>
				Enjoy!
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		@apply bg-black text-gray-300 font-sans;
	}

	.big-button {
		@apply px-8 py-4 rounded-full text-lg font-medium text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50;
	}

	.loader {
		@apply w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto;
	}

	.gradient-text {
		background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: gradient 10s ease infinite;
		background-size: 300% 300%;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
