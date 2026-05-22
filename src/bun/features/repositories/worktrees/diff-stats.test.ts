import { describe, expect, test } from "bun:test";
import { parseDiffNumStat } from "./diff-stats";

describe("parseDiffNumStat", () => {
	test("sums added and removed lines", () => {
		const output = ["3\t1\tfile.ts", "0\t5\tother.ts"].join("\n");

		expect(parseDiffNumStat(output)).toEqual({
			filesModified: 2,
			linesAdded: 3,
			linesRemoved: 6,
		});
	});

	test("ignores binary placeholders and blank lines", () => {
		const output = ["-\t-\tbinary.png", "", "2\t0\ttext.md"].join("\n");

		expect(parseDiffNumStat(output)).toEqual({
			filesModified: 2,
			linesAdded: 2,
			linesRemoved: 0,
		});
	});

	test("returns zeros for empty output", () => {
		expect(parseDiffNumStat("")).toEqual({
			filesModified: 0,
			linesAdded: 0,
			linesRemoved: 0,
		});
	});
});
