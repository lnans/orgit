import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveTerminalCwd } from "./index";

describe("resolveTerminalCwd", () => {
	test("prefers worktree over workspace", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const worktree = mkdtempSync(join(workspace, "wt-"));
		expect(resolveTerminalCwd(workspace, worktree)).toBe(worktree);
	});

	test("falls back to repository then workspace then home", () => {
		const home = homedir();
		expect(resolveTerminalCwd(home, "/missing/worktree", home)).toBe(home);
		expect(resolveTerminalCwd(home, undefined)).toBe(home);
		expect(resolveTerminalCwd("", undefined)).toBe(home);
	});

	test("skips paths that do not exist on disk", () => {
		const home = homedir();
		expect(
			resolveTerminalCwd(
				"/missing/workspace",
				"/missing/worktree",
				"/missing/repo",
			),
		).toBe(home);
	});
});
