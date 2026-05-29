import { describe, expect, test } from "bun:test";
import type { Worktree } from "@shared/types";
import { hasWorktreeChanges } from "./worktree-changes";

function worktree(overrides: Partial<Worktree> = {}): Worktree {
	return {
		name: "feature",
		path: "/repo/feature",
		filesModified: 0,
		linesAdded: 0,
		linesRemoved: 0,
		...overrides,
	};
}

describe("hasWorktreeChanges", () => {
	test("returns false when all stats are zero", () => {
		expect(hasWorktreeChanges(worktree())).toBe(false);
	});

	test("returns true when lines were added", () => {
		expect(hasWorktreeChanges(worktree({ linesAdded: 1 }))).toBe(true);
	});

	test("returns true when lines were removed", () => {
		expect(hasWorktreeChanges(worktree({ linesRemoved: 2 }))).toBe(true);
	});

	test("returns true when files were modified", () => {
		expect(hasWorktreeChanges(worktree({ filesModified: 3 }))).toBe(true);
	});
});
