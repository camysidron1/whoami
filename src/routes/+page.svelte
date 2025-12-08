<script lang="ts">
	import { Hero, About } from '$lib/components/sections';
	import { ScrollReveal } from '$lib/components/animations';
</script>

<main class="page">
	<!-- Hero Section - scroll-linked Theatre.js animation -->
	<Hero title="Hello, World" subtitle="I'm a creative developer" />

	<!-- About Section - also scroll-linked -->
	<About
		heading="About Me"
		paragraphs={[
			'This is an example section demonstrating Theatre.js scroll-linked animations.',
			'Open the Theatre.js Studio panel (Alt+\\) to visually design your animations.',
			'Drag keyframes, adjust easing curves, and see changes in real-time.'
		]}
	/>

	<!-- Example of simple ScrollReveal without Theatre.js -->
	<section class="example-section">
		<ScrollReveal>
			<h2>Simple Animations</h2>
		</ScrollReveal>

		<ScrollReveal delay={200} direction="left">
			<p>
				Not everything needs Theatre.js. Use the ScrollReveal component for simple fade-in
				animations.
			</p>
		</ScrollReveal>

		<ScrollReveal delay={400} direction="right">
			<p>Mix and match approaches based on complexity needs.</p>
		</ScrollReveal>
	</section>

	<!-- Spacer for scroll demo -->
	<section class="spacer">
		<ScrollReveal>
			<p class="hint">Keep scrolling to see more animations...</p>
		</ScrollReveal>
	</section>
</main>

<style>
	.page {
		width: 100%;
	}

	.example-section {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		gap: 2rem;
	}

	.example-section h2 {
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		color: white;
	}

	.example-section p {
		font-size: clamp(1rem, 2vw, 1.25rem);
		color: rgba(255, 255, 255, 0.7);
		max-width: 600px;
	}

	.spacer {
		min-height: 50vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hint {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.875rem;
	}
</style>
