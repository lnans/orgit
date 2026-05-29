import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import {
	snapTerminalContainerHeight,
	syncAlternateBufferViewport,
} from "./viewport";

export type TerminalDimensions = {
	cols: number;
	rows: number;
};

/**
 * Fits the terminal to its container, snaps row height, and syncs the
 * alternate-buffer viewport. Returns the resulting column/row dimensions.
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

	fitAddon.fit();
	if (container && snapTerminalContainerHeight(terminal, container)) {
		fitAddon.fit();
	}
	syncAlternateBufferViewport(terminal);

	return {
		cols: terminal.cols,
		rows: terminal.rows,
	};
}
