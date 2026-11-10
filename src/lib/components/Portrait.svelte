<script lang="ts">
	import { onMount } from 'svelte';

	import { reducedMotion } from '$lib/motion';
	import { PORTRAIT_ROWS } from '$lib/portrait';
	import { onRainSignal } from '$lib/rainSignals';

	const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
	const CELL_WIDTH = 7;
	const CELL_HEIGHT = 11;
	const COLUMNS = PORTRAIT_ROWS[0].length;
	const ROWS = PORTRAIT_ROWS.length;
	const WIDTH = COLUMNS * CELL_WIDTH;
	const HEIGHT = ROWS * CELL_HEIGHT;

	const FALL_ROWS_PER_SECOND = 55;
	const MAX_START_DELAY_SECONDS = 0.6;
	const SHIMMER_CELLS_PER_FRAME = 3;
	const BRIGHTEST = 9;
	/** Above 1 darkens midtones, so the lit side of the face stands out from the glyph noise. */
	const CONTRAST = 2;

	let canvas: HTMLCanvasElement;

	const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const ratio = Math.min(devicePixelRatio || 1, 2);
		canvas.width = WIDTH * ratio;
		canvas.height = HEIGHT * ratio;
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		ctx.font = `10px ${getComputedStyle(document.body).fontFamily}`;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'center';

		let ink = '';
		let highlight = '';
		const readColors = () => {
			const styles = getComputedStyle(document.documentElement);
			ink = styles.getPropertyValue('--phosphor').trim();
			highlight = styles.getPropertyValue('--head').trim();
		};
		readColors();

		const glyphs = PORTRAIT_ROWS.map((row) => Array.from(row, glyph));
		const startDelays = Array.from(
			{ length: COLUMNS },
			() => Math.random() * MAX_START_DELAY_SECONDS
		);

		const drawCell = (row: number, column: number, asFallingHead = false) => {
			const x = column * CELL_WIDTH;
			const y = row * CELL_HEIGHT;
			ctx.clearRect(x, y, CELL_WIDTH, CELL_HEIGHT);
			const brightness = Number(PORTRAIT_ROWS[row][column]);
			if (!asFallingHead && brightness === 0) return;
			ctx.globalAlpha = asFallingHead ? 1 : Math.pow(brightness / BRIGHTEST, CONTRAST);
			ctx.fillStyle = asFallingHead || brightness === BRIGHTEST ? highlight : ink;
			ctx.fillText(glyphs[row][column], x + CELL_WIDTH / 2, y);
		};

		const drawAll = () => {
			for (let row = 0; row < ROWS; row++) {
				for (let column = 0; column < COLUMNS; column++) drawCell(row, column);
			}
		};

		if (reducedMotion()) {
			drawAll();
			return onRainSignal((signal) => {
				if (signal.type === 'recolor') {
					readColors();
					drawAll();
				}
			});
		}

		// Each column falls into place like rain; then a few glyphs keep changing so it stays alive.
		const revealedRows = new Array<number>(COLUMNS).fill(0);
		let start = 0;
		let frame = 0;

		const tick = (now: number) => {
			start ||= now;
			const seconds = (now - start) / 1000;
			let falling = false;

			for (let column = 0; column < COLUMNS; column++) {
				if (revealedRows[column] >= ROWS) continue;
				falling = true;
				const front = Math.floor((seconds - startDelays[column]) * FALL_ROWS_PER_SECOND);
				for (let row = revealedRows[column]; row < Math.min(front, ROWS); row++) {
					drawCell(row, column);
				}
				revealedRows[column] = Math.max(revealedRows[column], Math.min(front, ROWS));
				if (front >= 0 && front < ROWS) drawCell(front, column, true);
			}

			if (!falling) {
				for (let i = 0; i < SHIMMER_CELLS_PER_FRAME; i++) {
					const row = Math.floor(Math.random() * ROWS);
					const column = Math.floor(Math.random() * COLUMNS);
					glyphs[row][column] = glyph();
					drawCell(row, column);
				}
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);

		const unsubscribe = onRainSignal((signal) => {
			if (signal.type !== 'recolor') return;
			readColors();
			for (let column = 0; column < COLUMNS; column++) {
				for (let row = 0; row < revealedRows[column]; row++) drawCell(row, column);
			}
		});

		return () => {
			cancelAnimationFrame(frame);
			unsubscribe();
		};
	});
</script>

<div role="img" aria-label="Portrait of Cam Ysidron drawn in glyphs">
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
	canvas {
		width: min(100%, 378px);
		aspect-ratio: 378 / 462;
	}
</style>
