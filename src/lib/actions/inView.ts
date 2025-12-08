import { browser } from '$app/environment';

export interface InViewOptions {
	/** Threshold for intersection (0-1) */
	threshold?: number;
	/** Root margin (CSS margin syntax) */
	rootMargin?: string;
	/** Only trigger once */
	once?: boolean;
}

export interface InViewCallbacks {
	onEnter?: () => void;
	onLeave?: () => void;
}

/**
 * Svelte action for detecting when an element enters/leaves the viewport
 *
 * Usage:
 * <div use:inView={{ threshold: 0.5 }} onenter={handleEnter} onleave={handleLeave}>
 */
export function inView(node: HTMLElement, options: InViewOptions = {}) {
	if (!browser) return;

	const { threshold = 0.1, rootMargin = '0px', once = false } = options;

	let hasEntered = false;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if (once && hasEntered) return;
					hasEntered = true;
					node.dispatchEvent(new CustomEvent('enter'));
				} else if (hasEntered || !once) {
					node.dispatchEvent(new CustomEvent('leave'));
				}
			});
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		},
		update(newOptions: InViewOptions) {
			// Reconnect with new options if needed
			observer.disconnect();
			const newObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							node.dispatchEvent(new CustomEvent('enter'));
						} else {
							node.dispatchEvent(new CustomEvent('leave'));
						}
					});
				},
				{
					threshold: newOptions.threshold ?? threshold,
					rootMargin: newOptions.rootMargin ?? rootMargin
				}
			);
			newObserver.observe(node);
		}
	};
}
