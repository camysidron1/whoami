import { describe, expect, it } from 'vitest';

import { complete, NAV, resolve } from './commands';
import { projects } from './content';

describe('resolve', () => {
	it('resolves every command shown in the nav to its own view', () => {
		for (const name of NAV) {
			expect(resolve(name)).toEqual({ view: name });
		}
	});

	it('resolves help, which is typed but not shown in the nav', () => {
		expect(resolve('help')).toEqual({ view: 'help' });
	});

	it('ignores case and surrounding whitespace', () => {
		expect(resolve('  WORK  ')).toEqual({ view: 'work' });
	});

	it.each([
		['exp', 'experience'],
		['log', 'experience'],
		['ls', 'work'],
		['projects', 'work'],
		['about', 'whoami'],
		['home', 'whoami'],
		['?', 'help']
	])('treats %s as an alias for %s', (alias, view) => {
		expect(resolve(alias)).toEqual({ view });
	});

	it('opens a project by its id', () => {
		const index = projects.findIndex((p) => p.id === 'sca');
		expect(resolve('open sca')).toEqual({ view: 'work', projectIndex: index });
		expect(resolve('cat sca')).toEqual({ view: 'work', projectIndex: index });
	});

	it('accepts the trailing slash the project list displays', () => {
		expect(resolve('open sca/')).toEqual(resolve('open sca'));
	});

	it('returns null for a project that does not exist', () => {
		expect(resolve('open nothing')).toBeNull();
		expect(resolve('open')).toBeNull();
	});

	it('returns null for unknown or empty commands', () => {
		expect(resolve('sudo rm -rf /')).toBeNull();
		expect(resolve('')).toBeNull();
		expect(resolve('   ')).toBeNull();
	});

	it('does not resolve inherited object keys as aliases', () => {
		expect(resolve('constructor')).toBeNull();
		expect(resolve('toString')).toBeNull();
	});
});

describe('complete', () => {
	it('finishes a command when only one matches', () => {
		expect(complete('exp')).toBe('experience');
		expect(complete('he')).toBe('help');
	});

	it('adds a space after a command that takes an argument', () => {
		expect(complete('op')).toBe('open ');
		expect(complete('th')).toBe('theme ');
	});

	it('finishes a project id after open', () => {
		expect(complete('open up')).toBe('open upstream');
		expect(complete('cat fl')).toBe('cat fleet-monitor');
	});

	it('finishes a theme name after theme', () => {
		expect(complete('theme a')).toBe('theme amber');
	});

	it('stops at the shared prefix when several options match', () => {
		expect(complete('open s')).toBeNull(); // sca and submission-intake share only "s"
		expect(complete('w')).toBeNull(); // whoami and work share only "w"
	});

	it('ignores case', () => {
		expect(complete('EXP')).toBe('experience');
	});

	it('returns null when there is nothing to add', () => {
		expect(complete('')).toBeNull();
		expect(complete('zzz')).toBeNull();
		expect(complete('work')).toBeNull();
		expect(complete('open sca')).toBeNull();
		expect(complete('open zzz')).toBeNull();
	});

	it('does not complete arguments for commands that take none', () => {
		expect(complete('work s')).toBeNull();
		expect(complete('constructor x')).toBeNull();
	});
});
