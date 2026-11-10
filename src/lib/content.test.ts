import { describe, expect, it } from 'vitest';

import { resolve } from './commands';
import { projects, roles } from './content';

describe('projects', () => {
	it('gives each project a unique id, since ids address projects from the prompt', () => {
		const ids = projects.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('uses ids that can be typed as a single lowercase word', () => {
		for (const { id } of projects) {
			expect(id).toMatch(/^[a-z0-9-]+$/);
		}
	});

	it('lets every project be opened from the prompt', () => {
		projects.forEach((project, index) => {
			expect(resolve(`open ${project.id}`)).toEqual({ view: 'work', projectIndex: index });
		});
	});
});

describe('roles', () => {
	it('gives each role a unique date range, which the timeline uses as its key', () => {
		const ranges = roles.map((r) => r.when);
		expect(new Set(ranges).size).toBe(ranges.length);
	});
});
