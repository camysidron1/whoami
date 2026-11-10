<script lang="ts">
	import { onMount } from 'svelte';

	import { reducedMotion } from '$lib/motion';

	const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:=*+<>';
	const CELL = 20;
	const MAX_FRAME_SECONDS = 0.05;

	interface Column {
		x: number;
		/** Head position in rows. Fractional, so trail brightness flows between frames. */
		y: number;
		speed: number;
		length: number;
		chars: string[];
	}

	let canvas: HTMLCanvasElement;

	const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const styles = getComputedStyle(document.documentElement);
		const headColor = styles.getPropertyValue('--head').trim();
		const trailColor = styles.getPropertyValue('--phosphor').trim();
		const still = reducedMotion();

		let width = 0;
		let height = 0;
		let rows = 0;
		let columns: Column[] = [];

		const restart = (column: Column, fromTop: boolean) => {
			column.length = 10 + Math.random() * 22;
			column.speed = 5 + Math.random() * 13;
			column.y = fromTop
				? -Math.random() * 12
				: Math.random() * (rows + column.length) - column.length / 2;
		};

		const draw = (seconds: number) => {
			ctx.clearRect(0, 0, width, height);
			for (const column of columns) {
				column.y += column.speed * seconds;
				if (column.y - column.length > rows) restart(column, true);
				if (Math.random() < 0.08) column.chars[Math.floor(Math.random() * rows)] = glyph();

				const head = Math.floor(column.y);
				for (let row = head; row > head - column.length; row--) {
					if (row < 0 || row >= rows) continue;
					const distance = column.y - row;
					if (distance < 1) {
						ctx.globalAlpha = 1;
						ctx.fillStyle = headColor;
					} else {
						ctx.globalAlpha = Math.pow(1 - distance / column.length, 1.7) * 0.9;
						ctx.fillStyle = trailColor;
					}
					ctx.fillText(column.chars[row], column.x, row * CELL);
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
					chars: Array.from({ length: rows }, glyph)
				};
				restart(column, false);
				return column;
			});
			if (still) draw(0);
		};

		let frame = 0;
		let last = 0;
		const tick = (now: number) => {
			draw(last ? Math.min(MAX_FRAME_SECONDS, (now - last) / 1000) : 0);
			last = now;
			frame = requestAnimationFrame(tick);
		};

		resize();
		addEventListener('resize', resize);
		if (!still) frame = requestAnimationFrame(tick);

		return () => {
			removeEventListener('resize', resize);
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
