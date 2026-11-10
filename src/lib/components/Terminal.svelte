<script lang="ts">
	import { onMount } from 'svelte';

	import { reveal } from '$lib/actions/reveal';
	import { complete, NAV, resolve, type ViewName } from '$lib/commands';
	import { projects } from '$lib/content';
	import { pause } from '$lib/motion';
	import { signalRain } from '$lib/rainSignals';
	import { reply } from '$lib/replies';
	import { applyTheme, restoreTheme } from '$lib/theme';

	import Contact from './views/Contact.svelte';
	import Experience from './views/Experience.svelte';
	import Help from './views/Help.svelte';
	import Now from './views/Now.svelte';
	import Stack from './views/Stack.svelte';
	import Whoami from './views/Whoami.svelte';
	import Work from './views/Work.svelte';

	const HOME: ViewName = 'whoami';
	const TYPING_MS = 26;
	const SUBMIT_MS = 140;
	const LEAVE_MS = 160;

	const sanFrancisco = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Los_Angeles',
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});

	/** The view on screen. null means the last command printed lines instead of opening a view. */
	let view: ViewName | null = $state(HOME);
	/** Lines printed by a command that has no view. null means the command was not found. */
	let printed: string[] | null = $state(null);
	/** The command echoed above the output. Empty after `clear`. */
	let echo: string = $state(HOME);
	/** Bumped per command so the output remounts and its print animation replays. */
	let outputKey = $state(0);
	let leaving = $state(false);
	let projectIndex = $state(0);

	let typed = $state('');
	let clock = $state('');
	let caretX = $state(0);

	let terminal: HTMLElement;
	let output: HTMLElement;
	let input: HTMLInputElement;
	let ruler: HTMLElement;

	/** Identifies the latest command, so an earlier one still animating can bail out. */
	let latestRun = 0;

	/** Every command run this visit, oldest first. */
	const commandHistory: string[] = [];
	/** Position in `commandHistory` while browsing it with the arrow keys. null when not browsing. */
	let historyCursor: number | null = null;

	async function run(raw: string, { typeIt = false } = {}) {
		const id = ++latestRun;
		const superseded = () => id !== latestRun;
		const command = raw.trim();

		if (typeIt) {
			typed = '';
			for (const char of command) {
				typed += char;
				await pause(TYPING_MS);
				if (superseded()) return;
			}
			await pause(SUBMIT_MS);
			if (superseded()) return;
		}
		typed = '';
		historyCursor = null;

		leaving = true;
		await pause(LEAVE_MS);
		if (superseded()) return;
		leaving = false;
		output.scrollTop = 0;

		const resolved = resolve(command);
		const answer = resolved ? null : reply(command, commandHistory);
		commandHistory.push(command);

		if (resolved?.view === 'work') projectIndex = resolved.projectIndex ?? 0;
		view = resolved?.view ?? null;
		printed = answer?.lines ?? null;
		echo = answer?.effect === 'clear' ? '' : command;
		outputKey++;

		if (answer?.theme) applyTheme(answer.theme);
		if (answer?.effect === 'surge') signalRain({ type: 'surge' });

		const hash = view && view !== HOME ? `#${view}` : '';
		if (location.hash !== hash) {
			history.replaceState(null, '', hash || location.pathname + location.search);
		}
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (typed.trim()) run(typed);
	}

	/** Each keystroke sends a ring of light through the rain from the caret. */
	function ripple() {
		const box = input.getBoundingClientRect();
		signalRain({ type: 'pulse', x: box.left + caretX, y: box.top + box.height / 2 });
	}

	function browseHistory(step: number) {
		if (!commandHistory.length) return;
		const next = (historyCursor ?? commandHistory.length) + step;
		if (next >= commandHistory.length) {
			historyCursor = null;
			typed = '';
		} else {
			historyCursor = Math.max(0, next);
			typed = commandHistory[historyCursor];
		}
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault();
			typed = complete(typed) ?? typed;
			return;
		}

		const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
		if (!step) return;
		event.preventDefault();

		// With an empty prompt in the work view, the arrows move through the project list.
		// Everywhere else they browse command history, as in a shell.
		if (view === 'work' && !typed && historyCursor === null) {
			projectIndex = (projectIndex + step + projects.length) % projects.length;
		} else {
			browseHistory(step);
		}
	}

	function runFromHash() {
		const name = location.hash.slice(1) || HOME;
		if (name !== view) run(name, { typeIt: true });
	}

	// The native caret is hidden; a block cursor follows the measured width of the typed text.
	$effect(() => {
		void typed;
		caretX = Math.min(ruler.offsetWidth, input.clientWidth);
	});

	onMount(() => {
		restoreTheme();

		const tick = () => (clock = sanFrancisco.format(new Date()));
		tick();
		const timer = setInterval(tick, 1000);

		if (location.hash.length > 1) run(location.hash.slice(1));

		// On desktop the prompt keeps focus, as a terminal does, unless text is being selected.
		const keepFocus = (event: MouseEvent) => {
			const onControl = (event.target as Element).closest('button, a');
			if (!onControl && !String(getSelection())) input.focus({ preventScroll: true });
		};
		const desktop = matchMedia('(pointer: fine)').matches;
		if (desktop) {
			input.focus({ preventScroll: true });
			terminal.addEventListener('click', keepFocus);
		}

		return () => {
			clearInterval(timer);
			terminal.removeEventListener('click', keepFocus);
		};
	});
</script>

<svelte:window onhashchange={runFromHash} />

<main class="terminal" bind:this={terminal}>
	<div class="titlebar">
		<span>cam@ysidron.dev: ~</span>
		<span>San Francisco {clock}</span>
	</div>

	<nav aria-label="Commands">
		{#each NAV as name (name)}
			<button
				type="button"
				aria-current={view === name}
				onclick={() => run(name, { typeIt: true })}
			>
				{name}
			</button>
		{/each}
	</nav>

	<section class="output" class:leaving bind:this={output} aria-live="polite">
		{#key outputKey}
			<div use:reveal>
				{#if echo}
					<p class="echo ln">~$ <b>{echo}</b></p>
				{/if}
				{#if view === 'whoami'}
					<Whoami />
				{:else if view === 'now'}
					<Now />
				{:else if view === 'work'}
					<Work bind:index={projectIndex} />
				{:else if view === 'experience'}
					<Experience />
				{:else if view === 'stack'}
					<Stack />
				{:else if view === 'contact'}
					<Contact />
				{:else if view === 'help'}
					<Help />
				{:else if printed}
					{#each printed as line, i (i)}
						<p class="printed ln">{line}</p>
					{/each}
				{:else}
					<p class="ln">command not found: {echo.split(/\s+/)[0]}</p>
				{/if}
			</div>
		{/key}
	</section>

	<form class="prompt" autocomplete="off" onsubmit={submit}>
		<label for="command"><span class="host">cam@ysidron.dev:</span>~$</label>
		<div class="field">
			<input
				id="command"
				type="text"
				spellcheck="false"
				autocapitalize="off"
				autocorrect="off"
				aria-label="Type a command"
				bind:this={input}
				bind:value={typed}
				onkeydown={handleKey}
				oninput={ripple}
			/>
			<span class="caret" style:transform="translateX({caretX}px)"></span>
			<span class="ruler" bind:this={ruler}>{typed}</span>
		</div>
	</form>
</main>

<style>
	.terminal {
		position: relative;
		box-sizing: border-box;
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr) auto;
		height: 100%;
		max-width: 1080px;
		margin: 0 auto;
		border: 1px solid var(--faint);
		background: var(--panel);
		box-shadow:
			0 0 90px rgb(var(--glow) / 0.09),
			inset 0 0 60px rgb(var(--glow) / 0.03);
		animation: boot 0.9s var(--ease) both;
	}

	/* Scanlines. */
	.terminal::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0) 0 2px,
			rgba(0, 0, 0, 0.16) 2px 3px
		);
	}

	@keyframes boot {
		from {
			opacity: 0;
			transform: scale(0.985);
		}
	}

	.titlebar,
	nav,
	.prompt {
		padding-inline: 1rem;
	}

	.titlebar {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 0.6rem;
		border-bottom: 1px solid var(--faint);
		color: var(--dim);
		font-size: 0.85em;
		font-variant-numeric: tabular-nums;
	}

	.titlebar span {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		padding-block: 0.75rem;
		border-bottom: 1px solid var(--faint);
	}

	nav button {
		position: relative;
		padding: 0.2rem 0;
		border: 0;
		background: none;
		color: var(--dim);
		font: inherit;
		cursor: pointer;
		transition:
			color 0.25s var(--ease),
			text-shadow 0.25s var(--ease);
	}

	nav button::before {
		content: './';
		opacity: 0.55;
	}

	nav button::after {
		content: '';
		position: absolute;
		inset: auto 0 -1px;
		height: 1px;
		background: var(--phosphor);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.35s var(--ease);
	}

	nav button:hover,
	nav button[aria-current='true'] {
		color: var(--phosphor);
		text-shadow: 0 0 12px var(--phosphor-glow);
	}

	nav button[aria-current='true']::after {
		transform: scaleX(1);
	}

	.output {
		min-height: 0;
		padding: 1.25rem 1rem 2rem;
		overflow-y: auto;
		scrollbar-color: var(--faint) transparent;
		scrollbar-width: thin;
	}

	.output.leaving {
		opacity: 0;
		transform: translateY(-6px);
		transition:
			opacity 0.16s ease-in,
			transform 0.16s ease-in;
	}

	.echo {
		margin-bottom: 1.25rem;
		color: var(--dim);
	}

	.printed {
		margin: 0;
		white-space: pre-wrap;
	}

	.echo b {
		color: var(--phosphor);
		font-weight: 500;
	}

	.prompt {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-block: 0.7rem;
		border-top: 1px solid var(--faint);
	}

	.prompt label {
		color: var(--dim);
		white-space: nowrap;
	}

	.host {
		display: none;
	}

	.field {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		padding: 0;
		border: 0;
		outline: 0;
		background: none;
		color: var(--phosphor);
		font: inherit;
		caret-color: transparent;
		text-shadow: 0 0 10px var(--phosphor-glow);
	}

	.caret {
		position: absolute;
		top: 50%;
		left: 0;
		width: 0.62em;
		height: 1.25em;
		margin-top: -0.625em;
		pointer-events: none;
		background: var(--phosphor);
		box-shadow: 0 0 12px var(--phosphor-glow);
		transition: transform 0.08s linear;
		animation: blink 1.15s ease-in-out infinite;
	}

	@keyframes blink {
		0%,
		45% {
			opacity: 1;
		}
		60%,
		90% {
			opacity: 0.12;
		}
	}

	.ruler {
		position: absolute;
		visibility: hidden;
		white-space: pre;
	}

	@media (min-width: 560px) {
		.host {
			display: inline;
		}
	}

	@media (min-width: 760px) {
		.titlebar,
		nav,
		.prompt {
			padding-inline: 1.75rem;
		}

		.output {
			padding: 1.75rem 1.75rem 2.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.terminal,
		.caret {
			animation: none;
		}

		nav button,
		nav button::after,
		.output.leaving {
			transition: none;
		}
	}
</style>
