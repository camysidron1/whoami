export const reducedMotion = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Waits for an animation beat. Resolves immediately when the visitor prefers reduced motion. */
export const pause = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, reducedMotion() ? 0 : ms));
