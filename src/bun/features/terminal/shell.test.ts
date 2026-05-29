import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { getDefaultShell, getShellArgs, resolveShellCandidates } from "./shell";

describe("getShellArgs", () => {
	test("uses login flag for zsh and bash", () => {
		expect(getShellArgs("/bin/zsh")).toEqual(["-l"]);
		expect(getShellArgs("/usr/local/bin/bash")).toEqual(["-l"]);
	});

	test("uses no args for other shells", () => {
		expect(getShellArgs("/bin/fish")).toEqual([]);
	});
});

describe("resolveShellCandidates", () => {
	test("returns unique absolute paths", () => {
		const candidates = resolveShellCandidates();
		expect(candidates.length).toBeGreaterThan(0);
		expect(new Set(candidates).size).toBe(candidates.length);
		for (const shell of candidates) {
			expect(shell.startsWith("/")).toBe(true);
		}
	});
});

describe("getDefaultShell", () => {
	test("returns an executable shell path", () => {
		const shell = getDefaultShell();
		expect(shell.length).toBeGreaterThan(0);
		expect(existsSync(shell)).toBe(true);
	});
});
