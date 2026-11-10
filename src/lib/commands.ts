import { projects } from './content';
import { THEMES } from './theme';

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

/** Commands that are typed but have no view of their own. */
const SHELL_COMMANDS = ['open', 'theme', 'clear', 'history'];

const ARGUMENTS: Record<string, readonly string[]> = {
	open: projects.map((p) => p.id),
	cat: projects.map((p) => p.id),
	theme: THEMES
};

function commonPrefix(words: readonly string[]) {
	let prefix = words[0] ?? '';
	for (const word of words) {
		while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
	}
	return prefix;
}

/**
 * Tab completion. Returns the longest unambiguous completion of what was typed,
 * or null when there is nothing to add.
 */
export function complete(typed: string): string | null {
	const text = typed.trimStart().toLowerCase();
	if (!text) return null;

	const space = text.indexOf(' ');
	if (space === -1) {
		const matches = [...VIEWS, ...SHELL_COMMANDS].filter((name) => name.startsWith(text));
		const completed = commonPrefix(matches);
		if (!completed) return null;
		const takesArgument = matches.length === 1 && Object.hasOwn(ARGUMENTS, completed);
		const result = takesArgument ? `${completed} ` : completed;
		return result === text ? null : result;
	}

	const command = text.slice(0, space);
	const argument = text.slice(space + 1).trimStart();
	if (!Object.hasOwn(ARGUMENTS, command)) return null;
	const matches = ARGUMENTS[command].filter((option) => option.startsWith(argument));
	const completed = commonPrefix(matches);
	return completed && completed !== argument ? `${command} ${completed}` : null;
}
