<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let state: 'idle' | 'loading' | 'fetched' | 'redirecting' = 'idle';
	let url: string | null = null;
	let title: string | null = null;
	let source: 'reddit' | 'hackernews' | 'wikipedia' | null = null; // Updated to persist source
	let error: string | null = null;
	let history: Array<{
		url: string;
		title: string;
		source: 'reddit' | 'hackernews' | 'wikipedia';
	}> = [];
	let preferences = [
		{ name: 'InternetIsBeautiful', enabled: true },
		{ name: 'todayilearned', enabled: true },
		{ name: 'Documentaries', enabled: true },
		{ name: 'science', enabled: true },
		{ name: 'technology', enabled: true },
		{ name: 'worldnews', enabled: true },
		{ name: 'UpliftingNews', enabled: true },
		{ name: 'space', enabled: true },
		{ name: 'dataisbeautiful', enabled: true },
		{ name: 'gadgets', enabled: true },
		{ name: 'listentothis', enabled: true },
		{ name: 'DepthHub', enabled: true },
	];

	let isSidebarOpen = false;

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function loadPreferences() {
		const storedPreferences = localStorage.getItem('subredditPreferences');
		if (storedPreferences) {
			preferences = JSON.parse(storedPreferences);
		}
	}

	function savePreferences() {
		localStorage.setItem('subredditPreferences', JSON.stringify(preferences));
	}

	function toggleAllPreferences(checked: boolean) {
		preferences = preferences.map((pref) => ({ ...pref, enabled: checked }));
		savePreferences();
	}

	function getStoredData() {
		const storedHistory = JSON.parse(localStorage.getItem('urlHistory') || '[]');
		return { history: storedHistory };
	}

	function setStoredData(newItem: {
		url: string;
		title: string;
		source: 'reddit' | 'hackernews' | 'wikipedia';
	}) {
		const updatedHistory = [newItem, ...history.filter((item) => item.url !== newItem.url)];
		localStorage.setItem('urlHistory', JSON.stringify(updatedHistory));
		history = updatedHistory;
	}

	async function fetchRandomPost(selectedSource: 'reddit' | 'hackernews' | 'wikipedia') {
		state = 'loading';
		error = null;
		source = selectedSource; // Set the source to the selected source
		try {
			let response;
			if (source === 'reddit') {
				const enabledPreferences = preferences
					.filter((pref) => pref.enabled)
					.map((pref) => pref.name);
				if (enabledPreferences.length === 0) {
					throw new Error('Please select at least one subreddit preference');
				}
				response = await fetch(`/api/random/${source}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ preferences: enabledPreferences })
				});
			} else {
				response = await fetch(`/api/random/${source}`);
			}

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('API response:', data);

			// Handle the response based on the source
			if (source === 'wikipedia') {
				if (
					data &&
					data.content_urls &&
					data.content_urls.desktop &&
					data.content_urls.desktop.page
				) {
					url = data.content_urls.desktop.page; // Get the URL from the response
					title = data.title || null;
					setStoredData({
						url: url,
						title: title || '',
						source: 'wikipedia'
					});
					state = 'fetched';
				} else {
					throw new Error(`No valid URL found in the Wikipedia response`);
				}
			} else {
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
			}
		} catch (err) {
			error = `Error fetching from ${source}: ${err.message}`;
			state = 'idle';
			console.error('Error fetching random post:', err);
		}
	}

	let buttonScale = spring(1);
	let buttonColor = spring(0);

	function pulse(color: 'emerald' | 'indigo' | 'rose') {
		buttonScale.set(1.1);
		buttonColor.set(1);
		setTimeout(() => {
			buttonScale.set(1);
			buttonColor.set(0);
		}, 300);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'r' || event.key === 'R') {
			pulse('indigo');
			fetchRandomPost('reddit');
		} else if (event.key === 'h' || event.key === 'H') {
			pulse('indigo');
			fetchRandomPost('hackernews');
		} else if (event.key === 'w' || event.key === 'W') {
			pulse('indigo');
			fetchRandomPost('wikipedia');
		} else if (event.key === 'v' || event.key === 'V') {
			if (url) window.open(url, '_blank');
			pulse('emerald');
		} else if (event.key === 'n' || event.key === 'N') {
			pulse('rose');
			state = 'idle';
			source = null; // Reset the source
		} else if (event.key === 'e' || event.key === 'E') {
			pulse('indigo');
			fetchRandomPost(source === 'wikipedia' ? 'wikipedia' : 'reddit');
		}
	}

	onMount(() => {
		loadPreferences();
		const { history: storedHistory } = getStoredData();
		history = storedHistory;
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
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
	<main class="flex-grow flex flex-col items-center justify-center p-4 relative">
		<button
			on:click={toggleSidebar}
			class="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors duration-300"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>
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
							pulse('indigo');
							fetchRandomPost('reddit');
						}}
						class="big-button bg-red-600 hover:bg-red-700"
						style="transform: scale({$buttonScale})"
					>
						Reddit <kbd class="ml-2 px-2 py-1 text-sm bg-red-700 rounded">R</kbd>
					</button>
					<button
						on:click={() => {
							pulse('indigo');
							fetchRandomPost('hackernews');
						}}
						class="big-button bg-orange-600 hover:bg-orange-700"
						style="transform: scale({$buttonScale})"
					>
						HN <kbd class="ml-2 px-2 py-1 text-sm bg-orange-700 rounded">H</kbd>
					</button>
					<button
						on:click={() => {
							pulse('indigo');
							fetchRandomPost('wikipedia');
						}}
						class="big-button bg-blue-600 hover:bg-blue-700"
						style="transform: scale({$buttonScale})"
					>
						Wikipedia <kbd class="ml-2 px-2 py-1 text-sm bg-blue-700 rounded">W</kbd>
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
						<a
							href={url}
							target="_blank"
							class="big-button bg-emerald-600 hover:bg-emerald-700 inline-block text-center transform transition-all duration-300 hover:scale-105 hover:rotate-1"
							style="transform: scale({$buttonScale})"
							on:click={() => pulse('emerald')}
						>
							Visit Site <kbd class="ml-2 px-2 py-1 text-sm bg-emerald-700 rounded shadow-inner"
								>V</kbd
							>
						</a>
						<button
							on:click={() => {
								pulse('indigo');
								fetchRandomPost(source); // Fetch from the current source
							}}
							class="big-button bg-indigo-600 hover:bg-indigo-700 text-gray-200 transform transition-all duration-300 hover:scale-105 hover:-rotate-1"
							style="transform: scale({$buttonScale})"
						>
							Next Link <kbd class="ml-2 px-2 py-1 text-sm bg-indigo-700 rounded shadow-inner"
								>E</kbd
							>
						</button>
						<button
							on:click={() => {
								pulse('rose');
								state = 'idle';
								source = null; // Reset the source
							}}
							class="big-button bg-rose-600 hover:bg-rose-700 text-gray-200 transform transition-all duration-300 hover:scale-105 hover:rotate-1"
							style="transform: scale({$buttonScale})"
						>
							Start Over <kbd class="ml-2 px-2 py-1 text-sm bg-rose-700 rounded shadow-inner">N</kbd
							>
						</button>
					</div>
				</div>
			{:else if state === 'redirecting'}
				<div in:fly={{ y: 20, duration: 300 }} class="text-center">
					<p class="text-xl text-gray-300 mb-2">Here we go, off to the link!</p>
					<a href={url} class="text-blue-400 hover:text-blue-300 break-all text-lg" target="_blank">
						{url}
					</a>
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
								target="_blank"
								in:fly={{ y: 20, duration: 300, delay: i * 50 }}
							>
								<p class="text-sm text-gray-500 mb-2">
									{item.source === 'reddit'
										? 'Reddit'
										: item.source === 'hackernews'
											? 'Hacker News'
											: 'Wikipedia'}
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

<div
	class="fixed right-0 top-0 h-full w-64 bg-gray-950 p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform {isSidebarOpen
		? 'translate-x-0'
		: 'translate-x-full'} z-50"
>
	<button
		on:click={toggleSidebar}
		class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</button>
	<h2 class="text-2xl font-semibold mb-6 text-gray-300 gradient-text">Subreddit Preferences</h2>
	<div class="flex items-center mb-4">
		<input
			type="checkbox"
			id="selectAll"
			checked={preferences.every((pref) => pref.enabled)}
			on:change={(e) => toggleAllPreferences(e.target.checked)}
			class="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
		/>
		<label
			for="selectAll"
			class="ml-2 text-gray-300 hover:text-white transition-colors duration-300">Select All</label
		>
	</div>
	{#each preferences as pref}
		<div class="flex items-center mb-4">
			<input
				type="checkbox"
				id={pref.name}
				bind:checked={pref.enabled}
				on:change={savePreferences}
				class="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
			/>
			<label
				for={pref.name}
				class="ml-2 text-gray-300 hover:text-white transition-colors duration-300"
				>{pref.name}</label
			>
		</div>
	{/each}
</div>

<style>
	:global(body) {
		@apply bg-black text-gray-300 font-sans overflow-x-hidden;
	}

	.big-button {
		@apply px-8 py-4 rounded-full text-lg font-medium text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg;
	}

	.loader {
		@apply w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto;
	}

	.gradient-text {
		background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
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

	.big-button {
		position: relative;
		overflow: hidden;
	}

	.big-button::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 300%;
		height: 300%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
		transform: translate(-50%, -50%) scale(0);
		transition: transform 0.5s ease-out;
	}

	.big-button:active::after {
		transform: translate(-50%, -50%) scale(1);
		transition: transform 0s;
	}
</style>
