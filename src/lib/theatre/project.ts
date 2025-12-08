import core from '@theatre/core';
import type { IProject, ISheet, IProjectConfig } from '@theatre/core';
import { browser } from '$app/environment';

const { getProject } = core;

// Theatre.js project singleton
let project: IProject | null = null;
let studioInitialized = false;

// Project state file - save this after designing your animations
// You can export this from Theatre.js Studio and import it here
const savedState: IProjectConfig['state'] | undefined = undefined;

/**
 * Initialize Theatre.js project
 * Call this once when your app mounts
 */
export function initTheatre(): IProject {
	if (project) return project;

	project = getProject('whoami', {
		state: savedState
	});

	return project;
}

/**
 * Initialize Theatre.js Studio (development only)
 * This provides the visual timeline editor
 */
export async function initStudio(): Promise<void> {
	if (!browser || studioInitialized) return;

	// Only load studio in development
	if (import.meta.env.DEV) {
		const studio = await import('@theatre/studio').then((m) => m.default);
		studio.initialize();
		studioInitialized = true;

		console.log('🎬 Theatre.js Studio initialized');
		console.log('Press Alt+\\ to toggle the studio panel');
	}
}

/**
 * Get or create a sheet for a section
 * Sheets are like scenes in a movie - each can have its own timeline
 */
export function getSheet(name: string): ISheet {
	if (!project) {
		project = initTheatre();
	}
	return project.sheet(name);
}

/**
 * Get the main project instance
 */
export function getTheatreProject(): IProject | null {
	return project;
}

/**
 * Helper to create a sheet object with typed props
 * Use this in your Svelte components
 */
export function createSheetObject<T extends Record<string, unknown>>(
	sheetName: string,
	objectName: string,
	defaultProps: T
) {
	const sheet = getSheet(sheetName);
	return sheet.object(objectName, defaultProps);
}
