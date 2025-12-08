import { writable, derived } from 'svelte/store';

// Configuration
export const TOTAL_STAGES = 4; // Adjust based on your sections

// Core stores
export const currentStage = writable(0);
export const scrollProgress = writable(0); // 0-1 representing scroll within viewport
export const isTransitioning = writable(false);

// Derived store combining all progression state
export const progression = derived(
	[currentStage, scrollProgress, isTransitioning],
	([$stage, $scroll, $transitioning]) => ({
		stage: $stage,
		scroll: $scroll,
		transitioning: $transitioning,
		// Overall progress across all stages (0-1)
		overall: ($stage + $scroll) / TOTAL_STAGES,
		// Useful for Theatre.js timeline position
		timelinePosition: $stage + $scroll
	})
);

// Actions
export function nextStage() {
	currentStage.update((n) => Math.min(n + 1, TOTAL_STAGES - 1));
}

export function prevStage() {
	currentStage.update((n) => Math.max(n - 1, 0));
}

export function goToStage(stage: number) {
	if (stage >= 0 && stage < TOTAL_STAGES) {
		isTransitioning.set(true);
		currentStage.set(stage);
		// Reset transitioning after animation completes
		setTimeout(() => isTransitioning.set(false), 800);
	}
}

export function setScrollProgress(progress: number) {
	scrollProgress.set(Math.max(0, Math.min(1, progress)));
}

// Utility to calculate scroll progress within a section
export function calculateSectionProgress(
	scrollY: number,
	sectionTop: number,
	sectionHeight: number
): number {
	const relativeScroll = scrollY - sectionTop;
	return Math.max(0, Math.min(1, relativeScroll / sectionHeight));
}
