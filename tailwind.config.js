/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				bg: '#181818',
				surface: '#212121'
			},
			fontFamily: {
				uncut: ['UncutSans', 'sans-serif']
			}
		}
	},
	plugins: []
};
