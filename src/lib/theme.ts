import { signalRain } from './rainSignals';

export const THEMES = ['green', 'amber', 'white'] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'theme';

export const isTheme = (name: unknown): name is Theme =>
	(THEMES as readonly unknown[]).includes(name);

/** Switches the phosphor color. The palettes live in app.css under `[data-theme]`. */
export function applyTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// Storage can be blocked. The theme still applies for this visit.
	}
	signalRain({ type: 'recolor' });
}

/** Re-applies the theme the visitor chose on an earlier visit, if any. */
export function restoreTheme() {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (isTheme(saved)) applyTheme(saved);
	} catch {
		// No stored theme available. Keep the default.
	}
}
