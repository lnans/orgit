import { describe, expect, test } from "bun:test";
import type { Terminal } from "@xterm/xterm";
import { snapTerminalContainerHeight } from "./viewport";

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
