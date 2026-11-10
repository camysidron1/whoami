import { isTheme, THEMES, type Theme } from './theme';

/** What a command that is not a view answers with. */
export interface Reply {
	lines: string[];
	effect?: 'surge' | 'clear';
	theme?: Theme;
}

const sanFranciscoDate = new Intl.DateTimeFormat('en-US', {
	timeZone: 'America/Los_Angeles',
	dateStyle: 'full',
	timeStyle: 'long'
});

/**
 * Answers shell-style commands that print a line or trigger an effect without
 * changing the view. Returns null when the command is not one of them.
 */
export function reply(raw: string, history: readonly string[]): Reply | null {
	const [command = '', ...args] = raw.trim().split(/\s+/);

	switch (command.toLowerCase()) {
		case 'theme': {
			const theme = args[0]?.toLowerCase();
			return isTheme(theme)
				? { lines: [`theme: ${theme}`], theme }
				: { lines: [THEMES.join('  ')] };
		}
		case 'clear':
			return { lines: [], effect: 'clear' };
		case 'history':
			return { lines: history.map((entry, i) => `${String(i + 1).padStart(3)}  ${entry}`) };
		case 'echo':
			return { lines: [args.join(' ')] };
		case 'pwd':
			return { lines: ['/home/cam'] };
		case 'date':
			return { lines: [sanFranciscoDate.format(new Date())] };
		case 'sudo':
			return { lines: ['cam is not in the sudoers file. This incident will be reported.'] };
		case 'rm':
			return { lines: ['Nice try.'] };
		case 'exit':
		case 'quit':
		case 'logout':
			return { lines: ['There is no exit.'] };
		case 'neo':
		case 'matrix':
			return { lines: ['Wake up.'], effect: 'surge' };
		default:
			return null;
	}
}
