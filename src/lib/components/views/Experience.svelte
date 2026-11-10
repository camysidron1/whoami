<script lang="ts">
	import { decode } from '$lib/actions/decode';
	import { roles } from '$lib/content';
</script>

<h2 class="ln" use:decode>Experience</h2>
<div class="log">
	{#each roles as role (role.when)}
		<span class="when ln">{role.when}</span>
		<span class="org ln">{role.org}</span>
		<span class="ln">{role.title}</span>
		<span class="note ln">{role.note}</span>
	{/each}
</div>
<dl class="kv">
	<dt class="ln">2022 to 2024</dt>
	<dd class="ln">
		University of Pennsylvania, graduate coursework in computer and information technology
	</dd>
	<dt class="ln">2015 to 2019</dt>
	<dd class="ln">Louisiana State University, B.S. chemical engineering</dd>
</dl>

<style>
	.log {
		display: grid;
		grid-template-columns: max-content max-content minmax(0, 1fr);
		gap: 0.1rem 1.5rem;
		max-width: 72ch;
		margin-top: 1rem;
		font-variant-numeric: tabular-nums;
	}

	.when {
		color: var(--dim);
	}

	.org {
		color: var(--phosphor);
	}

	.note {
		grid-column: 3;
		margin-bottom: 0.9rem;
		color: var(--dim);
	}

	@media (max-width: 560px) {
		.log {
			grid-template-columns: minmax(0, 1fr);
		}

		.note {
			grid-column: 1;
		}

		.when {
			margin-top: 0.4rem;
		}
	}
</style>
