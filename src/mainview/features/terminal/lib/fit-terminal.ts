import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { snapTerminalContainerHeight } from "./viewport";

export type TerminalDimensions = {
	cols: number;
	rows: number;
};

/**
 * Fits the terminal to its container and snaps row height. Returns the
 * resulting column/row dimensions.
 */
export function fitTerminalDimensions(
	fitAddon: FitAddon | null,
	terminal: Terminal | null,
	container: HTMLElement | null,
	fallback: TerminalDimensions = { cols: 80, rows: 24 },
): TerminalDimensions {
	if (!fitAddon || !terminal) {
		return fallback;
	}

	// Allow the container to grow with its parent before measuring (snapping sets a fixed height).
	if (container) {
		container.style.height = "";
	}

	fitAddon.fit();
	if (container && snapTerminalContainerHeight(terminal, container)) {
		fitAddon.fit();
	}

	return {
		cols: terminal.cols,
		rows: terminal.rows,
	};
}
