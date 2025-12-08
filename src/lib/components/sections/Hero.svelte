<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getSheet, linkElementToSequence } from '$lib/theatre';
	import type { ISheetObject } from '@theatre/core';

	interface Props {
		title?: string;
		subtitle?: string;
	}

	let { title = 'Hello, World', subtitle = "I'm a creative developer" }: Props = $props();

	let sectionEl: HTMLElement;
	let cleanup: (() => void) | null = null;

	// Animation values controlled by Theatre.js
	let titleOpacity = $state(0);
	let titleY = $state(50);
	let titleScale = $state(0.9);
	let subtitleOpacity = $state(0);
	let subtitleY = $state(30);
	let backgroundHue = $state(220);
	let overlayOpacity = $state(0.8);

	let titleObj: ISheetObject<typeof titleProps> | null = null;
	let subtitleObj: ISheetObject<typeof subtitleProps> | null = null;
	let backgroundObj: ISheetObject<typeof backgroundProps> | null = null;

	// Define the animatable properties with their initial values
	// These will appear in the Theatre.js Studio editor
	const titleProps = {
		opacity: 0,
		y: 50,
		scale: 0.9
	};

	const subtitleProps = {
		opacity: 0,
		y: 30
	};

	const backgroundProps = {
		hue: 220,
		overlayOpacity: 0.8
	};

	onMount(() => {
		if (!browser) return;

		// Get the Hero sheet from Theatre.js
		const sheet = getSheet('Hero');

		// Create animated objects - these appear in the Studio timeline
		titleObj = sheet.object('Title', titleProps);
		subtitleObj = sheet.object('Subtitle', subtitleProps);
		backgroundObj = sheet.object('Background', backgroundProps);

		// Subscribe to value changes and update our state
		const unsubTitle = titleObj.onValuesChange((values) => {
			titleOpacity = values.opacity;
			titleY = values.y;
			titleScale = values.scale;
		});

		const unsubSubtitle = subtitleObj.onValuesChange((values) => {
			subtitleOpacity = values.opacity;
			subtitleY = values.y;
		});

		const unsubBackground = backgroundObj.onValuesChange((values) => {
			backgroundHue = values.hue;
			overlayOpacity = values.overlayOpacity;
		});

		// Link scroll position to timeline
		// As user scrolls through this section, the timeline plays
		cleanup = linkElementToSequence(sectionEl, sheet, {
			start: 0,
			end: 3 // 3 second timeline
		});

		return () => {
			unsubTitle();
			unsubSubtitle();
			unsubBackground();
			cleanup?.();
		};
	});

	onDestroy(() => {
		cleanup?.();
	});
</script>

<section
	bind:this={sectionEl}
	class="hero"
	style="
		--bg-hue: {backgroundHue};
		--overlay-opacity: {overlayOpacity};
	"
>
	<div class="hero-background"></div>

	<div class="hero-content">
		<h1
			class="hero-title"
			style="
				opacity: {titleOpacity};
				transform: translateY({titleY}px) scale({titleScale});
			"
		>
			{title}
		</h1>

		<p
			class="hero-subtitle"
			style="
				opacity: {subtitleOpacity};
				transform: translateY({subtitleY}px);
			"
		>
			{subtitle}
		</p>
	</div>

	<div class="scroll-indicator" style="opacity: {1 - titleOpacity};">
		<span>Scroll to explore</span>
		<div class="scroll-arrow"></div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		min-height: 200vh; /* Extra height for scroll-linked animation */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.hero-background {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			hsl(var(--bg-hue), 60%, 8%) 0%,
			hsl(calc(var(--bg-hue) + 30), 50%, 12%) 50%,
			hsl(calc(var(--bg-hue) + 60), 40%, 6%) 100%
		);
		z-index: -2;
	}

	.hero-background::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 0%,
			rgba(0, 0, 0, var(--overlay-opacity)) 100%
		);
	}

	.hero-content {
		position: sticky;
		top: 50%;
		transform: translateY(-50%);
		text-align: center;
		z-index: 1;
		padding: 2rem;
	}

	.hero-title {
		font-size: clamp(2.5rem, 10vw, 6rem);
		font-weight: 700;
		color: white;
		margin: 0;
		letter-spacing: -0.02em;
		will-change: transform, opacity;
	}

	.hero-subtitle {
		font-size: clamp(1rem, 3vw, 1.5rem);
		color: rgba(255, 255, 255, 0.7);
		margin-top: 1rem;
		font-weight: 300;
		will-change: transform, opacity;
	}

	.scroll-indicator {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.875rem;
		transition: opacity 0.3s ease;
	}

	.scroll-arrow {
		width: 24px;
		height: 24px;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: rotate(45deg) translateY(0);
		}
		40% {
			transform: rotate(45deg) translateY(10px);
		}
		60% {
			transform: rotate(45deg) translateY(5px);
		}
	}
</style>
