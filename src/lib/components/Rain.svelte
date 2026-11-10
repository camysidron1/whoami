<script lang="ts">
	import { onMount } from 'svelte';

	import { reducedMotion } from '$lib/motion';
	import { onRainSignal } from '$lib/rainSignals';

	const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:=*+<>';
	/** Words from the work that a column occasionally spells on its way down. */
	const WORDS = ['TRIAGE', 'ROOTCAUSE', 'VARIANT', 'REMEDIATE', 'REACHABLE', 'AGENTS', 'SBOM'];
	const WORD_CHANCE = 0.07;

	const CELL = 20;
	const MAX_FRAME_SECONDS = 0.05;

	/** Glyphs within this many pixels of the pointer light up. */
	const POINTER_RADIUS = 150;
	const PULSE_SPEED = 900; // pixels per second
	const PULSE_SECONDS = 1.1;
	const PULSE_BAND = 46; // thickness of the ring, in pixels
	const SURGE_SECONDS = 2.8;
	const SURGE_SPEED_BOOST = 3;

	interface Column {
		x: number;
		/** Head position in rows. Fractional, so trail brightness flows between frames. */
		y: number;
		speed: number;
		length: number;
		chars: string[];
		word: string;
		wordRow: number;
	}

	interface Pulse {
		x: number;
		y: number;
		start: number;
	}

	let canvas: HTMLCanvasElement;

	const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const still = reducedMotion();
		let headColor = '';
		let trailColor = '';
		const readColors = () => {
			const styles = getComputedStyle(document.documentElement);
			headColor = styles.getPropertyValue('--head').trim();
			trailColor = styles.getPropertyValue('--phosphor').trim();
		};
		readColors();

		let width = 0;
		let height = 0;
		let rows = 0;
		let columns: Column[] = [];

		let pointer: { x: number; y: number } | null = null;
		let pulses: Pulse[] = [];
		let surgeEnds = 0;

		const restart = (column: Column, fromTop: boolean) => {
			column.length = 10 + Math.random() * 22;
			column.speed = 5 + Math.random() * 13;
			column.y = fromTop
				? -Math.random() * 12
				: Math.random() * (rows + column.length) - column.length / 2;
			column.word =
				Math.random() < WORD_CHANCE ? WORDS[Math.floor(Math.random() * WORDS.length)] : '';
			column.wordRow = Math.floor(Math.random() * Math.max(1, rows - column.word.length));
		};

		/** Extra light at a point from the pointer and from pulse rings, 0 to about 1. */
		const glowAt = (x: number, y: number, now: number) => {
			let glow = 0;
			if (pointer) {
				const distance = Math.hypot(x - pointer.x, y - pointer.y);
				if (distance < POINTER_RADIUS) glow += (1 - distance / POINTER_RADIUS) ** 2;
			}
			for (const pulse of pulses) {
				const age = (now - pulse.start) / 1000;
				const fromRing = Math.abs(Math.hypot(x - pulse.x, y - pulse.y) - age * PULSE_SPEED);
				if (fromRing < PULSE_BAND) {
					glow += (1 - fromRing / PULSE_BAND) * (1 - age / PULSE_SECONDS);
				}
			}
			return glow;
		};

		const draw = (seconds: number, now: number) => {
			pulses = pulses.filter((pulse) => now - pulse.start < PULSE_SECONDS * 1000);
			const surge = Math.max(0, (surgeEnds - now) / (SURGE_SECONDS * 1000));
			const speedScale = 1 + surge * SURGE_SPEED_BOOST;

			ctx.clearRect(0, 0, width, height);
			for (const column of columns) {
				column.y += column.speed * speedScale * seconds;
				if (column.y - column.length > rows) restart(column, true);
				if (Math.random() < 0.08) column.chars[Math.floor(Math.random() * rows)] = glyph();

				const head = Math.floor(column.y);
				const tail = head - column.length;
				// Glow reveals glyphs outside the trail, so lit columns scan every row.
				const lit =
					pulses.length > 0 || (pointer && Math.abs(column.x - pointer.x) < POINTER_RADIUS);
				const from = lit ? 0 : Math.max(0, Math.ceil(tail));
				const to = lit ? rows - 1 : Math.min(rows - 1, head);

				for (let row = from; row <= to; row++) {
					const distance = column.y - row;
					const inTrail = distance >= 0 && distance < column.length;
					const trail = inTrail ? Math.pow(1 - distance / column.length, 1.7) * 0.9 : 0;
					const glow = lit ? glowAt(column.x, row * CELL, now) : 0;
					const inWord =
						inTrail && row >= column.wordRow && row < column.wordRow + column.word.length;

					let alpha = trail + glow * (0.3 + trail);
					if (inWord) alpha *= 1.8;
					alpha = Math.min(1, alpha * (1 + surge));
					if (alpha < 0.02) continue;

					const isHead = inTrail && distance < 1;
					ctx.globalAlpha = isHead ? 1 : alpha;
					ctx.fillStyle = isHead || inWord ? headColor : trailColor;
					ctx.fillText(
						inWord ? column.word[row - column.wordRow] : column.chars[row],
						column.x,
						row * CELL
					);
				}
			}
			ctx.globalAlpha = 1;
		};

		const resize = () => {
			const ratio = Math.min(devicePixelRatio || 1, 2);
			width = innerWidth;
			height = innerHeight;
			canvas.width = width * ratio;
			canvas.height = height * ratio;
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			ctx.font = `15px ${getComputedStyle(document.body).fontFamily}`;
			ctx.textBaseline = 'top';
			ctx.textAlign = 'center';

			rows = Math.ceil(height / CELL) + 1;
			columns = Array.from({ length: Math.ceil(width / CELL) }, (_, i) => {
				const column: Column = {
					x: i * CELL + CELL / 2,
					y: 0,
					speed: 0,
					length: 0,
					chars: Array.from({ length: rows }, glyph),
					word: '',
					wordRow: 0
				};
				restart(column, false);
				return column;
			});
			if (still) draw(0, 0);
		};

		let frame = 0;
		let last = 0;
		const tick = (now: number) => {
			draw(last ? Math.min(MAX_FRAME_SECONDS, (now - last) / 1000) : 0, now);
			last = now;
			frame = requestAnimationFrame(tick);
		};

		const trackPointer = (event: PointerEvent) => {
			pointer = { x: event.clientX, y: event.clientY };
		};
		const losePointer = () => {
			pointer = null;
		};

		const unsubscribe = onRainSignal((signal) => {
			if (signal.type === 'recolor') {
				readColors();
				if (still) draw(0, 0);
			} else if (still) {
				return;
			} else if (signal.type === 'pulse') {
				pulses.push({ x: signal.x, y: signal.y, start: performance.now() });
			} else {
				surgeEnds = performance.now() + SURGE_SECONDS * 1000;
			}
		});

		resize();
		addEventListener('resize', resize);
		if (!still) {
			addEventListener('pointermove', trackPointer);
			document.documentElement.addEventListener('pointerleave', losePointer);
			frame = requestAnimationFrame(tick);
		}

		return () => {
			unsubscribe();
			removeEventListener('resize', resize);
			removeEventListener('pointermove', trackPointer);
			document.documentElement.removeEventListener('pointerleave', losePointer);
			cancelAnimationFrame(frame);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0.62;
	}
</style>
