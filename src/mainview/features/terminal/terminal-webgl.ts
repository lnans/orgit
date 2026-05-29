import { WebglAddon } from "@xterm/addon-webgl";
import type { Terminal } from "@xterm/xterm";

/**
 * Enables xterm's WebGL2 renderer for faster scroll/redraw. Falls back to the
 * default renderer if WebGL is unavailable or the GPU context is lost.
 */
export function loadWebglAddon(terminal: Terminal): () => void {
	const addon = new WebglAddon();
	const onContextLoss = addon.onContextLoss(() => {
		addon.dispose();
	});

	try {
		terminal.loadAddon(addon);
	} catch {
		onContextLoss.dispose();
		addon.dispose();
		return () => {};
	}

	return () => {
		onContextLoss.dispose();
		addon.dispose();
	};
}
