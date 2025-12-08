<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getSheet, linkElementToSequence } from '$lib/theatre';
	import { StaggerChildren } from '$lib/components/animations';

	interface Props {
		heading?: string;
		paragraphs?: string[];
	}

	let {
		heading = 'About Me',
		paragraphs = [
			'This is a placeholder paragraph. Replace it with your own content.',
			'Add more paragraphs to tell your story.',
			'Each paragraph will animate in sequence.'
		]
	}: Props = $props();

	let sectionEl: HTMLElement;
	let cleanup: (() => void) | null = null;

	// Theatre.js controlled values
	let headingX = $state(-100);
	let headingOpacity = $state(0);
	let lineWidth = $state(0);
	let contentOpacity = $state(0);

	onMount(() => {
		if (!browser) return;

		const sheet = getSheet('About');

		const headingObj = sheet.object('Heading', {
			x: -100,
			opacity: 0
		});

		const decorObj = sheet.object('Decoration', {
			lineWidth: 0
		});

		const contentObj = sheet.object('Content', {
			opacity: 0
		});

		const unsubHeading = headingObj.onValuesChange((values) => {
			headingX = values.x;
			headingOpacity = values.opacity;
		});

		const unsubDecor = decorObj.onValuesChange((values) => {
			lineWidth = values.lineWidth;
		});

		const unsubContent = contentObj.onValuesChange((values) => {
			contentOpacity = values.opacity;
		});

		cleanup = linkElementToSequence(sectionEl, sheet, {
			start: 0,
			end: 2
		});

		return () => {
			unsubHeading();
			unsubDecor();
			unsubContent();
			cleanup?.();
		};
	});

	onDestroy(() => {
		cleanup?.();
	});
</script>

<section bind:this={sectionEl} class="about">
	<div class="about-container">
		<div class="about-header">
			<h2
				class="about-heading"
				style="
					transform: translateX({headingX}px);
					opacity: {headingOpacity};
				"
			>
				{heading}
			</h2>
			<div class="about-line" style="width: {lineWidth}%;"></div>
		</div>

		<div class="about-content" style="opacity: {contentOpacity};">
			<StaggerChildren stagger={150} delay={200}>
				{#each paragraphs as paragraph, i (i)}
					<p class="about-paragraph">{paragraph}</p>
				{/each}
			</StaggerChildren>
		</div>
	</div>
</section>

<style>
	.about {
		min-height: 150vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		position: relative;
	}

	.about-container {
		max-width: 800px;
		width: 100%;
	}

	.about-header {
		margin-bottom: 3rem;
	}

	.about-heading {
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 700;
		color: white;
		margin: 0 0 1rem 0;
		will-change: transform, opacity;
	}

	.about-line {
		height: 3px;
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.1));
		will-change: width;
	}

	.about-content {
		will-change: opacity;
	}

	.about-paragraph {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 1.5rem;
	}

	.about-paragraph:last-child {
		margin-bottom: 0;
	}
</style>
