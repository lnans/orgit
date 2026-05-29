import { describe, expect, test } from "bun:test";
import type { Terminal } from "@xterm/xterm";
import {
	alternateBufferViewportNeedsSync,
	isCursorHomeParams,
	pinAlternateBufferToTop,
	snapTerminalContainerHeight,
	syncAlternateBufferViewport,
} from "./viewport";

describe("snapTerminalContainerHeight", () => {
	test("snaps container height to whole rows", () => {
		const container = {
			clientHeight: 205,
			style: { height: "" },
		} as unknown as HTMLElement;

		const terminal = {
			rows: 24,
			_core: {
				_renderService: {
					dimensions: { css: { cell: { height: 17 } } },
				},
			},
		};

		expect(
			snapTerminalContainerHeight(terminal as unknown as Terminal, container),
		).toBe(true);
		expect(container.style.height).toBe("408px");
	});
});

describe("isCursorHomeParams", () => {
	test("treats omitted and zero params as home", () => {
		expect(isCursorHomeParams([])).toBe(true);
		expect(isCursorHomeParams([0])).toBe(true);
		expect(isCursorHomeParams([0, 0])).toBe(true);
		expect(isCursorHomeParams([1, 1])).toBe(true);
	});

	test("rejects off-home positions", () => {
		expect(isCursorHomeParams([2, 1])).toBe(false);
		expect(isCursorHomeParams([1, 5])).toBe(false);
	});
});

describe("alternateBufferViewportNeedsSync", () => {
	test("is false when viewport is already at top", () => {
		const terminal = {
			buffer: { active: { type: "alternate" as const, viewportY: 0 } },
			element: { querySelector: () => ({ scrollTop: 0 }) },
		};
		expect(
			alternateBufferViewportNeedsSync(terminal as unknown as Terminal),
		).toBe(false);
	});

	test("is true when viewportY drifted", () => {
		const terminal = {
			buffer: { active: { type: "alternate" as const, viewportY: 3 } },
			element: { querySelector: () => ({ scrollTop: 0 }) },
		};
		expect(
			alternateBufferViewportNeedsSync(terminal as unknown as Terminal),
		).toBe(true);
	});
});

describe("syncAlternateBufferViewport", () => {
	test("scrolls xterm back to top when viewportY drifted", () => {
		let viewportY = 4;
		let refreshCalls = 0;
		const terminal = {
			rows: 30,
			buffer: {
				active: {
					type: "alternate" as const,
					get viewportY() {
						return viewportY;
					},
				},
			},
			scrollToTop() {
				viewportY = 0;
			},
			element: {
				querySelector: () => ({ scrollTop: 0 }),
			},
			refresh: () => {
				refreshCalls += 1;
			},
		};

		expect(syncAlternateBufferViewport(terminal as unknown as Terminal)).toBe(
			true,
		);
		expect(viewportY).toBe(0);
		expect(refreshCalls).toBe(1);
	});

	test("does nothing when already synced", () => {
		let refreshCalls = 0;
		const terminal = {
			rows: 30,
			buffer: { active: { type: "alternate" as const, viewportY: 0 } },
			scrollToTop() {},
			element: { querySelector: () => ({ scrollTop: 0 }) },
			refresh: () => {
				refreshCalls += 1;
			},
		};

		expect(syncAlternateBufferViewport(terminal as unknown as Terminal)).toBe(
			false,
		);
		expect(refreshCalls).toBe(0);
	});

	test("does nothing in normal buffer", () => {
		let scrollCalls = 0;
		const terminal = {
			buffer: { active: { type: "normal" as const, viewportY: 4 } },
			scrollToTop() {
				scrollCalls += 1;
			},
			element: {
				querySelector: () => ({ scrollTop: 48 }),
			},
			refresh: () => {},
		};

		expect(syncAlternateBufferViewport(terminal as unknown as Terminal)).toBe(
			false,
		);
		expect(scrollCalls).toBe(0);
	});
});

describe("pinAlternateBufferToTop", () => {
	test("clears drift without forcing refresh", () => {
		let viewportY = 2;
		let refreshCalls = 0;
		const viewport = { scrollTop: 24 };
		const terminal = {
			buffer: {
				active: {
					type: "alternate" as const,
					get viewportY() {
						return viewportY;
					},
				},
			},
			scrollToTop() {
				viewportY = 0;
			},
			element: { querySelector: () => viewport },
			refresh: () => {
				refreshCalls += 1;
			},
		};

		pinAlternateBufferToTop(terminal as unknown as Terminal);
		expect(viewportY).toBe(0);
		expect(viewport.scrollTop).toBe(0);
		expect(refreshCalls).toBe(0);
	});
});
