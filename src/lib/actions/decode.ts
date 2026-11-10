import { reducedMotion } from '$lib/motion';

const SCRAMBLE = '01<>/[]{}=+*#%&$';
const SCRAMBLED_AHEAD = 4;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

/** Reveals the node's text left to right, with a few scrambled characters ahead of the reveal. */
export function decode(node: HTMLElement) {
	const final = node.textContent ?? '';
	if (reducedMotion() || !final) return;

	const duration = Math.min(900, 300 + final.length * 28);
	const start = performance.now();
	let frame = 0;

	const step = (now: number) => {
		const progress = Math.min(1, (now - start) / duration);
		if (progress === 1) {
			node.textContent = final;
			return;
		}
		const revealed = Math.floor(easeOut(progress) * final.length);
		let text = final.slice(0, revealed);
		for (let i = revealed; i < Math.min(final.length, revealed + SCRAMBLED_AHEAD); i++) {
			text += final[i] === ' ' ? ' ' : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
		}
		node.textContent = text || ' ';
		frame = requestAnimationFrame(step);
	};
	frame = requestAnimationFrame(step);

	return {
		destroy() {
			cancelAnimationFrame(frame);
		}
	};
}
