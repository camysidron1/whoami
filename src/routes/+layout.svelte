<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Cam Ysidron</title>
	<meta
		name="description"
		content="Cam Ysidron is an AI engineer in San Francisco and founding engineer at Pi Security."
	/>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}
