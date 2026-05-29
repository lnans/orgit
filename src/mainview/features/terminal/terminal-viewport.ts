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

/**
 * Top-anchored TUIs (Copilot CLI) draw from row 1 in the alternate buffer.
 * Wheel scrolling updates xterm's internal viewportY without the app knowing;
 * /reset clears and redraws at home but leaves the viewport offset — the top looks cropped.
 */
export function syncAlternateBufferViewport(terminal: Terminal): void {
	if (terminal.buffer.active.type !== "alternate") {
		return;
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
}

/** Copilot /reset redraws asynchronously; re-sync while the UI settles. */
export function scheduleAlternateBufferViewportSync(terminal: Terminal): void {
	const delaysMs = [0, 50, 150, 400];
	for (const delayMs of delaysMs) {
		setTimeout(() => syncAlternateBufferViewport(terminal), delayMs);
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
	container: HTMLElement,
): () => void {
	const disposables = [
		terminal.buffer.onBufferChange(() => {
			syncAlternateBufferViewport(terminal);
		}),
		terminal.parser.registerCsiHandler({ final: "H" }, (params) => {
			if (isCursorHomeParams(params)) {
				queueMicrotask(() => syncAlternateBufferViewport(terminal));
			}
			return false;
		}),
		terminal.parser.registerCsiHandler({ final: "J" }, (params) => {
			const mode = params.length > 0 ? Number(params[0]) : 0;
			if (mode === 2 || mode === 3) {
				queueMicrotask(() => syncAlternateBufferViewport(terminal));
			}
			return false;
		}),
		terminal.parser.registerCsiHandler({ final: "h" }, (params) => {
			if (params.some((p) => p === 1049)) {
				queueMicrotask(() => syncAlternateBufferViewport(terminal));
			}
			return false;
		}),
		terminal.parser.registerCsiHandler({ final: "l" }, (params) => {
			if (params.some((p) => p === 1049)) {
				queueMicrotask(() => syncAlternateBufferViewport(terminal));
			}
			return false;
		}),
	];

	const onWheel = (event: WheelEvent) => {
		if (terminal.buffer.active.type !== "alternate") {
			return;
		}
		event.preventDefault();
		syncAlternateBufferViewport(terminal);
	};

	container.addEventListener("wheel", onWheel, { passive: false });

	return () => {
		for (const disposable of disposables) {
			disposable.dispose();
		}
		container.removeEventListener("wheel", onWheel);
	};
}
