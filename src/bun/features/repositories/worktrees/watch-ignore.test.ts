import { describe, expect, test } from "bun:test";
import { shouldIgnoreWatchEvent } from "./watch-ignore";

describe("shouldIgnoreWatchEvent", () => {
	test("returns false when filename is null", () => {
		expect(shouldIgnoreWatchEvent(null)).toBe(false);
	});

	test("ignores top-level node_modules paths without leading separator", () => {
		expect(shouldIgnoreWatchEvent("node_modules/pkg/index.js")).toBe(true);
	});

	test("ignores nested node_modules segments", () => {
		expect(shouldIgnoreWatchEvent("packages/app/node_modules/foo.js")).toBe(
			true,
		);
	});

	test("ignores .git path segments", () => {
		expect(shouldIgnoreWatchEvent(".git/index")).toBe(true);
		expect(shouldIgnoreWatchEvent("nested/.git/config")).toBe(true);
	});

	test("does not ignore normal source files", () => {
		expect(shouldIgnoreWatchEvent("src/index.ts")).toBe(false);
		expect(shouldIgnoreWatchEvent("README.md")).toBe(false);
	});

	test("does not ignore paths that only contain node_modules as substring", () => {
		expect(shouldIgnoreWatchEvent("my-node_modules-helper.ts")).toBe(false);
	});
});
