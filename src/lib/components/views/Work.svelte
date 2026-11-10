<script lang="ts">
	import { onMount, tick } from 'svelte';

	import { decode } from '$lib/actions/decode';
	import { reveal } from '$lib/actions/reveal';
	import { projects } from '$lib/content';
	import { reducedMotion } from '$lib/motion';

	const STACKED_LAYOUT = '(max-width: 760px)';

	let { index = $bindable(0) }: { index: number } = $props();

	let rows: HTMLButtonElement[] = $state([]);
	let detail: HTMLElement | undefined = $state();
	let bar = $state({ top: 0, height: 0 });

	const project = $derived(projects[index]);

	const placeBar = () => {
		const row = rows[index];
		if (row) bar = { top: row.offsetTop, height: row.offsetHeight };
	};

	$effect(placeBar);

	onMount(() => {
		// Row heights change once the web font replaces the fallback.
		document.fonts.ready.then(placeBar);
	});

	async function open(i: number) {
		index = i;
		if (!matchMedia(STACKED_LAYOUT).matches) return;
		await tick();
		detail?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
	}
</script>

<svelte:window onresize={placeBar} />

<div class="work">
	<div class="list">
		<span class="bar" style:transform="translateY({bar.top}px)" style:height="{bar.height}px"
		></span>
		{#each projects as p, i (p.id)}
			<button
				type="button"
				class="row ln"
				aria-current={i === index}
				bind:this={rows[i]}
				onclick={() => open(i)}
			>
				<span>{p.id}/</span>
				<small>{p.org}</small>
			</button>
		{/each}
	</div>

	{#key index}
		<article class="detail" bind:this={detail} use:reveal>
			<h2 class="ln" use:decode>{project.title}</h2>
			<div class="meta ln">{project.org}, {project.when}</div>
			<h3 class="ln">problem</h3>
			<p class="ln">{project.problem}</p>
			<h3 class="ln">what I built</h3>
			<p class="ln">{project.built}</p>
			<h3 class="ln">outcome</h3>
			<p class="ln">{project.result}</p>
			<ul class="tags ln">
				{#each project.stack as tool (tool)}
					<li>{tool}</li>
				{/each}
			</ul>
		</article>
	{/key}
</div>

<style>
	.work {
		display: grid;
		grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
		gap: 2.5rem;
		align-items: start;
	}

	.list {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	/* The selection bar slides between rows instead of each row highlighting itself. */
	.bar {
		position: absolute;
		inset: 0 0 auto;
		pointer-events: none;
		background: linear-gradient(90deg, rgba(61, 252, 126, 0.16), rgba(61, 252, 126, 0.03));
		box-shadow: inset 2px 0 0 var(--phosphor);
		transition:
			transform 0.34s var(--ease),
			height 0.34s var(--ease);
	}

	.row {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		padding: 0.5rem 0.8rem;
		border: 0;
		background: none;
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			color 0.2s,
			padding-left 0.3s var(--ease);
	}

	.row small {
		color: var(--dim);
		font-size: 0.85em;
	}

	.row:hover {
		padding-left: 1.1rem;
		color: var(--head);
	}

	.row[aria-current='true'] {
		padding-left: 1.1rem;
		color: var(--phosphor);
	}

	.detail {
		min-width: 0;
	}

	.meta {
		margin-bottom: 1.25rem;
		color: var(--dim);
	}

	h3 {
		margin: 0;
		color: var(--dim);
		font-size: 1em;
		font-weight: 500;
	}

	h3::before {
		content: '# ';
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.5rem;
		margin: 1.25rem 0 0;
		padding: 0;
		list-style: none;
	}

	.tags li {
		padding: 0.05rem 0.5rem;
		border: 1px solid var(--faint);
		color: var(--dim);
		font-size: 0.85em;
	}

	@media (max-width: 760px) {
		.work {
			grid-template-columns: minmax(0, 1fr);
			gap: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar,
		.row {
			transition: none;
		}
	}
</style>
