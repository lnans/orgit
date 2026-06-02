import { describe, expect, test } from "bun:test";
import { formatLogSessionFileName, resolveConfigDirName } from "./paths";

describe("resolveConfigDirName", () => {
	test("uses orgit-dev for the dev channel", () => {
		expect(resolveConfigDirName("dev")).toBe("orgit-dev");
	});

	test("uses orgit for other channels and when unknown", () => {
		expect(resolveConfigDirName("stable")).toBe("orgit");
		expect(resolveConfigDirName("canary")).toBe("orgit");
		expect(resolveConfigDirName(null)).toBe("orgit");
	});
});

describe("formatLogSessionFileName", () => {
	test("uses local date and time without colons", () => {
		expect(formatLogSessionFileName(new Date(2026, 5, 2, 10, 15, 30, 42))).toBe(
			"orgit-2026-06-02_10-15-30-042.log",
		);
	});
});
