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

function getDomViewportScrollTop(terminal: Terminal): number {
	const viewport = terminal.element?.querySelector(".xterm-viewport");
	if (
		viewport &&
		"scrollTop" in viewport &&
		typeof viewport.scrollTop === "number"
	) {
		return viewport.scrollTop;
	}
	return 0;
}

/** True when the alternate-buffer viewport has drifted from the top. */
export function alternateBufferViewportNeedsSync(terminal: Terminal): boolean {
	if (terminal.buffer.active.type !== "alternate") {
		return false;
	}
	return (
		terminal.buffer.active.viewportY !== 0 ||
		getDomViewportScrollTop(terminal) !== 0
	);
}

/**
 * Corrects viewport drift in the alternate buffer (e.g. after /reset leaves scroll offset).
 * No-op when already at the top — safe to call without penalizing scroll performance.
 */
export function syncAlternateBufferViewport(terminal: Terminal): boolean {
	if (!alternateBufferViewportNeedsSync(terminal)) {
		return false;
	}

	const active = terminal.buffer.active;
	if (active.viewportY !== 0) {
		terminal.scrollToTop();
	}

	const viewport = terminal.element?.querySelector(".xterm-viewport");
	if (
		viewport &&
		"scrollTop" in viewport &&
		typeof viewport.scrollTop === "number" &&
		viewport.scrollTop !== 0
	) {
		viewport.scrollTop = 0;
	}

	terminal.refresh(0, terminal.rows - 1);
	return true;
}

/** Force the alternate buffer to the top after Copilot /reset-style redraws. */
export function pinAlternateBufferToTop(terminal: Terminal): void {
	if (terminal.buffer.active.type !== "alternate") {
		return;
	}

	if (terminal.buffer.active.viewportY !== 0) {
		terminal.scrollToTop();
	}

	const viewport = terminal.element?.querySelector(".xterm-viewport");
	if (
		viewport &&
		"scrollTop" in viewport &&
		typeof viewport.scrollTop === "number" &&
		viewport.scrollTop !== 0
	) {
		viewport.scrollTop = 0;
	}
}

/** Copilot /reset redraws asynchronously; re-pin while the UI settles. */
export function scheduleAlternateBufferViewportSync(terminal: Terminal): void {
	const delaysMs = [0, 50, 150, 400];
	for (const delayMs of delaysMs) {
		setTimeout(() => pinAlternateBufferToTop(terminal), delayMs);
	}
}

/** Returns true when CSI CUP moves the cursor to the top-left (e.g. Copilot /reset). */
export function isCursorHomeParams(params: (number | number[])[]): boolean {
	const row = params.length > 0 ? Number(params[0]) : 0;
	const col = params.length > 1 ? Number(params[1]) : 0;
	return row <= 1 && col <= 1;
}

export function installAlternateBufferViewportGuards(
	terminal: Terminal,
): () => void {
	const pinAfterReset = () => {
		queueMicrotask(() => pinAlternateBufferToTop(terminal));
	};

	const disposables = [
		terminal.buffer.onBufferChange(() => {
			syncAlternateBufferViewport(terminal);
		}),
		terminal.parser.registerCsiHandler({ final: "H" }, (params) => {
			if (isCursorHomeParams(params)) {
				pinAfterReset();
			}
			return false;
		}),
		terminal.parser.registerCsiHandler({ final: "J" }, (params) => {
			const mode = params.length > 0 ? Number(params[0]) : 0;
			if (mode === 2 || mode === 3) {
				pinAfterReset();
			}
			return false;
		}),
		terminal.parser.registerCsiHandler({ final: "h" }, (params) => {
			if (params.some((p) => p === 1049)) {
				pinAfterReset();
			}
			return false;
		}),
	];

	return () => {
		for (const disposable of disposables) {
			disposable.dispose();
		}
	};
}
