import { browser } from '$app/environment';
import type { ISheet } from '@theatre/core';

interface ScrollSequenceOptions {
	/** The Theatre.js sheet to control */
	sheet: ISheet;
	/** Start position in seconds on the timeline */
	start?: number;
	/** End position in seconds on the timeline */
	end?: number;
	/** Element to track scroll within (defaults to document) */
	container?: HTMLElement | null;
	/** Offset from top to start animation (px or vh string) */
	startOffset?: number | string;
	/** Offset from top to end animation (px or vh string) */
	endOffset?: number | string;
}

/**
 * Links a Theatre.js sheet's timeline position to scroll progress
 * Returns a cleanup function to remove the scroll listener
 */
export function linkScrollToSequence(options: ScrollSequenceOptions): () => void {
	if (!browser) return () => {};

	const {
		sheet,
		start = 0,
		end = 3, // Default 3 second timeline - override with explicit end value
		container = null,
		startOffset = 0,
		endOffset = '100vh'
	} = options;

	const parseOffset = (offset: number | string): number => {
		if (typeof offset === 'number') return offset;
		if (offset.endsWith('vh')) {
			return (parseFloat(offset) / 100) * window.innerHeight;
		}
		return parseFloat(offset);
	};

	const updatePosition = () => {
		const scrollY = container ? container.scrollTop : window.scrollY;
		const startPx = parseOffset(startOffset);
		const endPx = parseOffset(endOffset);

		// Calculate scroll range
		const scrollStart = startPx;
		const scrollEnd = container
			? container.scrollHeight - container.clientHeight - endPx
			: document.documentElement.scrollHeight - window.innerHeight - endPx;

		// Calculate progress (0-1)
		const progress = Math.max(0, Math.min(1, (scrollY - scrollStart) / (scrollEnd - scrollStart)));

		// Map to timeline position
		const timelinePosition = start + progress * (end - start);

		// Update Theatre.js sequence position
		sheet.sequence.position = timelinePosition;
	};

	// Initial update
	updatePosition();

	// Listen to scroll
	const target = container || window;
	target.addEventListener('scroll', updatePosition, { passive: true });
	window.addEventListener('resize', updatePosition, { passive: true });

	// Return cleanup function
	return () => {
		target.removeEventListener('scroll', updatePosition);
		window.removeEventListener('resize', updatePosition);
	};
}

/**
 * Creates a scroll-linked sequence for a specific element
 * Animation plays as the element scrolls through the viewport
 */
export function linkElementToSequence(
	element: HTMLElement,
	sheet: ISheet,
	options: { start?: number; end?: number } = {}
): () => void {
	if (!browser) return () => {};

	const { start = 0, end = 3 } = options; // Default 3 second timeline

	const updatePosition = () => {
		const rect = element.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		// Progress: 0 when element enters bottom, 1 when it exits top
		const elementTop = rect.top;

		// Total travel = viewport height + element height
		const totalTravel = viewportHeight + rect.height;
		const traveled = viewportHeight - elementTop;

		const progress = Math.max(0, Math.min(1, traveled / totalTravel));
		const timelinePosition = start + progress * (end - start);

		sheet.sequence.position = timelinePosition;
	};

	updatePosition();

	window.addEventListener('scroll', updatePosition, { passive: true });
	window.addEventListener('resize', updatePosition, { passive: true });

	return () => {
		window.removeEventListener('scroll', updatePosition);
		window.removeEventListener('resize', updatePosition);
	};
}
