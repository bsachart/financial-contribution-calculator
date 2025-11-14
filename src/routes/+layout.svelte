<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Financial Contribution Calculator</title>
	<meta name="description" content="Fair, proportional financial contributions based on true financial capacity" />
</svelte:head>

{@render children()}