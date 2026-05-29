import { describe, expect, test } from "bun:test";
import { fitTerminalDimensions } from "./fit-terminal";

describe("fitTerminalDimensions", () => {
	test("returns fallback when fit addon or terminal is missing", () => {
		const fallback = { cols: 120, rows: 40 };
		expect(fitTerminalDimensions(null, null, null, fallback)).toBe(fallback);
	});
});
