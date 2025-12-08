<script lang="ts">
	import { onMount } from 'svelte';

	import { browser } from '$app/environment';

	import favicon from '$lib/assets/favicon.svg';
	import { initStudio, initTheatre } from '$lib/theatre';

	import '../app.css';

	let { children } = $props();

	onMount(() => {
		if (!browser) return;

		// Initialize Theatre.js project
		initTheatre();

		// Initialize Studio in development (provides visual timeline editor)
		initStudio();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<title>whoami</title>
</svelte:head>

{@render children()}
