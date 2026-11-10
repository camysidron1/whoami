/** Things the terminal can ask the background rain to do. */
export type RainSignal =
	/** A ring of light that spreads from a point, in viewport pixels. */
	| { type: 'pulse'; x: number; y: number }
	/** A few seconds of faster, brighter rain. */
	| { type: 'surge' }
	/** The theme changed, so colors must be read again. */
	| { type: 'recolor' };

type Listener = (signal: RainSignal) => void;

const listeners = new Set<Listener>();

export function signalRain(signal: RainSignal) {
	listeners.forEach((listener) => listener(signal));
}

/** Subscribes to rain signals. Returns the function that unsubscribes. */
export function onRainSignal(listener: Listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
