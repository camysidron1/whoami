<script lang="ts">
	import { inView } from '$lib/actions/inView';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Delay between each child animation in ms */
		stagger?: number;
		/** Base delay before first child animates */
		delay?: number;
		/** Duration of each child's animation */
		duration?: number;
		/** Intersection threshold to trigger */
		threshold?: number;
		/** Only animate once */
		once?: boolean;
		/** CSS selector for children to animate */
		selector?: string;
		class?: string;
	}

	let {
		children,
		stagger = 100,
		delay = 0,
		duration = 500,
		threshold = 0.2,
		once = true,
		selector = ':scope > *',
		class: className = ''
	}: Props = $props();

	let container: HTMLElement;
	let visible = $state(false);

	function handleEnter() {
		visible = true;
		if (!container) return;

		const childElements = container.querySelectorAll(selector);
		childElements.forEach((child, index) => {
			const el = child as HTMLElement;
			el.style.transitionDelay = `${delay + index * stagger}ms`;
			el.classList.add('stagger-visible');
		});
	}

	function handleLeave() {
		if (once) return;
		visible = false;
		if (!container) return;

		const childElements = container.querySelectorAll(selector);
		childElements.forEach((child) => {
			const el = child as HTMLElement;
			el.classList.remove('stagger-visible');
		});
	}
</script>

<div
	bind:this={container}
	use:inView={{ threshold, once }}
	onenter={handleEnter}
	onleave={handleLeave}
	class="stagger-container {className}"
	class:visible
	style="--duration: {duration}ms;"
>
	{@render children()}
</div>

<style>
	.stagger-container :global(> *) {
		opacity: 0;
		transform: translateY(20px);
		transition:
			opacity var(--duration) ease,
			transform var(--duration) ease;
	}

	.stagger-container :global(.stagger-visible) {
		opacity: 1;
		transform: translateY(0);
	}
</style>
