import { projects } from './content';

export const NAV = ['whoami', 'work', 'experience', 'stack', 'contact'] as const;
export const VIEWS = [...NAV, 'help'] as const;
export type ViewName = (typeof VIEWS)[number];

export interface Resolved {
	view: ViewName;
	/** Set when the command opens a specific project, e.g. `open sca`. */
	projectIndex?: number;
}

const ALIASES: Record<string, ViewName> = {
	exp: 'experience',
	log: 'experience',
	ls: 'work',
	projects: 'work',
	about: 'whoami',
	home: 'whoami',
	'?': 'help'
};

const isView = (name: string): name is ViewName => (VIEWS as readonly string[]).includes(name);

/** Maps what was typed at the prompt to a view, or null when the command is unknown. */
export function resolve(raw: string): Resolved | null {
	const [command = '', arg = ''] = raw.trim().toLowerCase().split(/\s+/);

	if (command === 'open' || command === 'cat') {
		const projectIndex = projects.findIndex((p) => p.id === arg.replace(/\/$/, ''));
		return projectIndex >= 0 ? { view: 'work', projectIndex } : null;
	}

	const name = ALIASES[command] ?? command;
	return isView(name) ? { view: name } : null;
}
