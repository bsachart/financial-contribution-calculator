import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),

		paths: {
			base: process.env.NODE_ENV === 'production' ? '/financial-contribution-calculator' : ''
		},

		prerender: {
			handleMissingId: 'ignore'
		}
	}
};

export default config;
