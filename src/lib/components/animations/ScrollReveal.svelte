<script lang="ts">
	import { inView } from '$lib/actions/inView';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		threshold?: number;
		delay?: number;
		duration?: number;
		once?: boolean;
		direction?: 'up' | 'down' | 'left' | 'right' | 'none';
		distance?: number;
		class?: string;
	}

	let {
		children,
		threshold = 0.2,
		delay = 0,
		duration = 600,
		once = true,
		direction = 'up',
		distance = 30,
		class: className = ''
	}: Props = $props();

	let visible = $state(false);

	const directionMap = {
		up: `translateY(${distance}px)`,
		down: `translateY(-${distance}px)`,
		left: `translateX(${distance}px)`,
		right: `translateX(-${distance}px)`,
		none: 'none'
	};

	const initialTransform = directionMap[direction];
</script>

<div
	use:inView={{ threshold, once }}
	onenter={() => (visible = true)}
	onleave={() => {
		if (!once) visible = false;
	}}
	class="scroll-reveal {className}"
	class:visible
	style="
		--delay: {delay}ms;
		--duration: {duration}ms;
		--initial-transform: {initialTransform};
	"
>
	{@render children()}
</div>

<style>
	.scroll-reveal {
		opacity: 0;
		transform: var(--initial-transform);
		transition:
			opacity var(--duration) ease calc(var(--delay)),
			transform var(--duration) ease calc(var(--delay));
		will-change: opacity, transform;
	}

	.scroll-reveal.visible {
		opacity: 1;
		transform: translateY(0) translateX(0);
	}
</style>
