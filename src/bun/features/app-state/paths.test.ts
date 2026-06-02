import { describe, expect, test } from "bun:test";
import { formatLogSessionFileName } from "./paths";

describe("formatLogSessionFileName", () => {
	test("uses local date and time without colons", () => {
		expect(formatLogSessionFileName(new Date(2026, 5, 2, 10, 15, 30, 42))).toBe(
			"orgit-2026-06-02_10-15-30-042.log",
		);
	});
});
