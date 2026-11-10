# whoami

Cam Ysidron's personal site: a terminal over digital rain. Visitors click or type commands and
the output prints in place.

| Command                                               | What it shows                         |
| ----------------------------------------------------- | ------------------------------------- |
| `whoami`, `work`, `experience`, `stack`, `contact` | The views, also in the nav        |
| `open <project>`                                      | A project in the work view            |
| `theme green`, `theme amber`, `theme white`           | Recolors the site and remembers it    |
| `help`, `clear`, `history`                            | Shell basics                          |

Tab completes commands and project names, and the up and down arrows browse history. A few other
commands (`sudo`, `neo`, `pwd` and friends) answer with a line.

Built with SvelteKit and prerendered to static files.

## Develop

```sh
bun install
bun run dev
```

| Command          | What it does                      |
| ---------------- | --------------------------------- |
| `bun run test`   | Unit tests (Vitest)               |
| `bun run check`  | Type check                        |
| `bun run lint`   | ESLint                            |
| `bun run format` | Prettier                          |
| `bun run build`  | Production build into `build/`    |

## Where things live

- `src/lib/content.ts`: projects and roles. Edit copy here.
- `src/lib/commands.ts`: maps what is typed at the prompt to a view, and handles tab completion.
- `src/lib/replies.ts`: commands that print a line or trigger an effect without opening a view.
- `src/lib/theme.ts`: the theme names and switching. The palettes are in `src/app.css`.
- `src/lib/components/Terminal.svelte`: the shell. Owns the current view, the prompt, history, and
  the sequence that runs a command.
- `src/lib/components/views/`: one component per view.
- `src/lib/components/Rain.svelte`: the background canvas. It reacts to the pointer and to signals.
- `src/lib/rainSignals.ts`: how the terminal talks to the rain (`pulse`, `surge`,
  `recolor`) without touching its canvas.
- `src/lib/actions/`: `decode` unscrambles headings, `reveal` staggers printed lines.
- `src/app.css`: color and type tokens, the theme palettes, and the shared `print` animation.

### Adding a project

Add an entry to `projects` in `content.ts`. Its `id` is what visitors type after `open`, so keep
it unique, lowercase, and free of spaces.

### Adding a command

1. Add the name to `NAV` (shown as a button) or `VIEWS` (typed only) in `commands.ts`.
2. Create its component in `components/views/`.
3. Render it from the `{#if}` chain in `Terminal.svelte`.

### Adding a reply

Add a `case` to `reply()` in `replies.ts`. Return the lines to print, plus an optional `effect` or
`theme`.

### Adding a theme

Add the name to `THEMES` in `theme.ts` and a matching `:root[data-theme='<name>']` block in
`app.css`. Set `--glow` to the phosphor color as space-separated channels.

## Deploy

Vercel builds every push. `main` goes to production at ysidron.dev, and other branches get a
preview URL. `vercel.json` points Vercel at the static `build/` output.

Each view has a URL hash, such as `#work`, so links to a view work on any static host.
