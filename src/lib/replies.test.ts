import { describe, expect, it } from 'vitest';

import { VIEWS } from './commands';
import { reply } from './replies';
import { THEMES } from './theme';

describe('reply', () => {
	it('returns null for commands it does not know', () => {
		expect(reply('nonsense', [])).toBeNull();
		expect(reply('', [])).toBeNull();
	});

	it('leaves view commands to the view resolver', () => {
		for (const view of VIEWS) {
			expect(reply(view, [])).toBeNull();
		}
	});

	it('switches to a named theme', () => {
		for (const theme of THEMES) {
			expect(reply(`theme ${theme}`, [])).toMatchObject({ theme });
		}
		expect(reply('theme AMBER', [])).toMatchObject({ theme: 'amber' });
	});

	it('lists the themes instead of switching when the name is missing or unknown', () => {
		for (const command of ['theme', 'theme purple']) {
			const answer = reply(command, []);
			expect(answer?.theme).toBeUndefined();
			expect(answer?.lines.join(' ')).toContain('amber');
		}
	});

	it('clears the screen without printing anything', () => {
		expect(reply('clear', [])).toEqual({ lines: [], effect: 'clear' });
	});

	it('prints the commands run so far, numbered from 1 in order', () => {
		const answer = reply('history', ['whoami', 'open sca']);
		expect(answer?.lines).toHaveLength(2);
		expect(answer?.lines[0]).toMatch(/^\s*1\s+whoami$/);
		expect(answer?.lines[1]).toMatch(/^\s*2\s+open sca$/);
	});

	it('echoes its arguments back', () => {
		expect(reply('echo hello   there', [])?.lines).toEqual(['hello there']);
	});

	it('makes the rain surge for neo', () => {
		expect(reply('neo', [])?.effect).toBe('surge');
	});

	it('ignores the case of the command but keeps the case of its arguments', () => {
		expect(reply('ECHO Hello', [])?.lines).toEqual(['Hello']);
	});

	it.each(['sudo rm -rf /', 'rm -rf /', 'exit', 'pwd', 'date'])(
		'answers %s with one line and no side effect',
		(command) => {
			const answer = reply(command, []);
			expect(answer?.lines).toHaveLength(1);
			expect(answer?.lines[0]).not.toBe('');
			expect(answer?.effect).toBeUndefined();
			expect(answer?.theme).toBeUndefined();
		}
	);
});
