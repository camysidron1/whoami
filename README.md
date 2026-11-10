# whoami

Cam Ysidron's personal site: a terminal over digital rain. Visitors click or type commands
(`whoami`, `work`, `experience`, `stack`, `contact`, `help`) and the output prints in place.

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
- `src/lib/commands.ts`: maps what is typed at the prompt to a view. Aliases live here.
- `src/lib/components/Terminal.svelte`: the shell. Owns the current view, the prompt, and the
  sequence that runs a command.
- `src/lib/components/views/`: one component per command.
- `src/lib/components/Rain.svelte`: the background canvas.
- `src/lib/actions/`: `decode` unscrambles headings, `reveal` staggers printed lines.
- `src/app.css`: color and type tokens, plus the shared `print` animation.

### Adding a project

Add an entry to `projects` in `content.ts`. Its `id` is what visitors type after `open`, so keep
it unique, lowercase, and free of spaces.

### Adding a command

1. Add the name to `NAV` (shown as a button) or `VIEWS` (typed only) in `commands.ts`.
2. Create its component in `components/views/`.
3. Render it from the `{#if}` chain in `Terminal.svelte`.

## Deploy

- **Vercel** serves the site at the domain root. `vercel.json` points it at the static `build/`
  output.
- **GitHub Pages** also publishes on every push to `main`, under `/whoami`. The workflow sets
  `BASE_PATH=/whoami` for that build (`.github/workflows/deploy.yml`).

Each view has a URL hash, such as `#work`, so links to a view work on any static host.
