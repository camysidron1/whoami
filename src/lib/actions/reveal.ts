/**
 * Numbers every `.ln` line inside the node so the global `print` animation
 * (app.css) can stagger them top to bottom.
 */
export function reveal(node: HTMLElement) {
	node.querySelectorAll<HTMLElement>('.ln').forEach((line, i) => {
		line.style.setProperty('--i', String(i));
	});
}
