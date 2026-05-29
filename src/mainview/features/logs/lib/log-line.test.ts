import { describe, expect, test } from "bun:test";
import { getLogLineClassName } from "./log-line";

describe("getLogLineClassName", () => {
	test("colors by log level", () => {
		const line = "[2026-05-27T12:00:00.000Z] WARN Something happened";

		expect(getLogLineClassName(line)).toContain("orange");
		expect(
			getLogLineClassName("[2026-05-27T12:00:00.000Z] ERROR Something failed"),
		).toContain("destructive");
		expect(
			getLogLineClassName("[2026-05-27T12:00:00.000Z] DEBUG Verbose detail"),
		).toContain("muted");
		expect(
			getLogLineClassName("[2026-05-27T12:00:00.000Z] INFO Ready"),
		).toContain("sidebar-foreground");
	});

	test("uses default for non-matching lines", () => {
		expect(getLogLineClassName("    at foo (bar.ts:1:1)")).toContain(
			"sidebar-foreground",
		);
	});
});
