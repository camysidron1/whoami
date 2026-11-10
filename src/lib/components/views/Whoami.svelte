<script lang="ts">
	import { decode } from '$lib/actions/decode';

	import Portrait from '../Portrait.svelte';
</script>

<div class="who">
	<div class="words">
		<h1 class="ln" aria-label="Cam Ysidron" use:decode>Cam Ysidron</h1>
		<p class="lede ln">
			I build AI agents that take a security finding from report to validated fix.
		</p>
		<p class="ln">
			I trained as a chemical engineer, then ran software programs for the robotaxi teams at Zoox. I
			went back to school at Penn so I could build the software instead of scheduling it. Now I'm
			the founding engineer at Pi Security.
		</p>
		<dl class="kv">
			<dt class="ln">based</dt>
			<dd class="ln">San Francisco</dd>
		</dl>
	</div>
	<Portrait />
</div>

<style>
	.who {
		display: grid;
		/* The portrait is 378px wide at full size and shrinks on narrower windows. */
		grid-template-columns: minmax(0, 1fr) min(378px, 42%);
		gap: 2.5rem;
		align-items: start;
	}

	h1 {
		font-size: clamp(2.1rem, 6vw, 4.2rem);
	}

	.lede {
		max-width: 46ch;
		color: var(--head);
		font-size: 1.12em;
	}

	@media (max-width: 760px) {
		.who {
			grid-template-columns: minmax(0, 1fr);
			gap: 1rem;
		}

		.who :global(canvas) {
			width: min(70%, 378px);
		}
	}
</style>
