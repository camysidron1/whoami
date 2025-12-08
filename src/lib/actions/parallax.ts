import { browser } from '$app/environment';

export interface ParallaxOptions {
	/** Speed multiplier (-1 to 1, where 0 is no movement) */
	speed?: number;
	/** Direction of parallax movement */
	direction?: 'vertical' | 'horizontal';
	/** Whether to use transform (better perf) or top/left */
	useTransform?: boolean;
}

/**
 * Svelte action for parallax scroll effects
 *
 * Usage:
 * <div use:parallax={{ speed: 0.5 }}>Moves slower than scroll</div>
 * <div use:parallax={{ speed: -0.3 }}>Moves opposite to scroll</div>
 */
export function parallax(node: HTMLElement, options: ParallaxOptions = {}) {
	if (!browser) return;

	const { speed = 0.5, direction = 'vertical', useTransform = true } = options;

	let ticking = false;

	const updatePosition = () => {
		const rect = node.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		// Calculate how far through the viewport the element is
		const elementCenter = rect.top + rect.height / 2;
		const viewportCenter = viewportHeight / 2;
		const offset = (elementCenter - viewportCenter) * speed;

		if (useTransform) {
			if (direction === 'vertical') {
				node.style.transform = `translateY(${offset}px)`;
			} else {
				node.style.transform = `translateX(${offset}px)`;
			}
		} else {
			if (direction === 'vertical') {
				node.style.top = `${offset}px`;
			} else {
				node.style.left = `${offset}px`;
			}
		}

		ticking = false;
	};

	const onScroll = () => {
		if (!ticking) {
			requestAnimationFrame(updatePosition);
			ticking = true;
		}
	};

	// Initial position
	updatePosition();

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', updatePosition, { passive: true });

	return {
		destroy() {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', updatePosition);
		},
		update(newOptions: ParallaxOptions) {
			Object.assign(options, newOptions);
			updatePosition();
		}
	};
}
