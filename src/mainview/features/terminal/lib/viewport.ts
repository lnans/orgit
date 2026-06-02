import type { Terminal } from "@xterm/xterm";

type TerminalWithCore = Terminal & {
	_core?: {
		_renderService?: {
			dimensions?: { css?: { cell?: { height?: number } } };
		};
	};
};

/** CSS cell height used by xterm's renderer (FitAddon uses the same). */
export function getTerminalCellHeight(terminal: Terminal): number | undefined {
	const core = (terminal as TerminalWithCore)._core;
	return core?._renderService?.dimensions?.css?.cell?.height;
}

/**
 * FitAddon can leave a fractional row; snap the container so every row is fully visible.
 */
export function snapTerminalContainerHeight(
	terminal: Terminal,
	container: HTMLElement,
): boolean {
	const cellHeight = getTerminalCellHeight(terminal);
	if (!cellHeight || cellHeight <= 0 || terminal.rows < 1) {
		return false;
	}

	const snappedHeight = Math.floor(cellHeight * terminal.rows);
	if (Math.abs(container.clientHeight - snappedHeight) <= 1) {
		return false;
	}

	container.style.height = `${snappedHeight}px`;
	return true;
}
