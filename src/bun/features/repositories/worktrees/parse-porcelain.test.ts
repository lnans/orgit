import { describe, expect, test } from "bun:test";
import { parseWorktreePorcelain } from "./parse-porcelain";

describe("parseWorktreePorcelain", () => {
	test("parses branch and skips main worktree entry", () => {
		const output = [
			"worktree /repo/main",
			"HEAD abc",
			"branch refs/heads/main",
			"",
			"worktree /repo/feature",
			"HEAD def",
			"branch refs/heads/feature-a",
			"",
		].join("\n");

		const entries = parseWorktreePorcelain(output);
		expect(entries).toHaveLength(2);
		expect(entries[0]).toEqual({ path: "/repo/main", branchName: "main" });
		expect(entries[1]).toEqual({
			path: "/repo/feature",
			branchName: "feature-a",
		});
	});

	test("marks detached worktrees", () => {
		const output = ["worktree /repo/detached", "HEAD abc", "detached", ""].join(
			"\n",
		);

		expect(parseWorktreePorcelain(output)).toEqual([
			{ path: "/repo/detached", branchName: "(detached)" },
		]);
	});

	test("uses unknown branch when branch line is missing", () => {
		const output = ["worktree /repo/orphan", "HEAD abc", ""].join("\n");

		expect(parseWorktreePorcelain(output)).toEqual([
			{ path: "/repo/orphan", branchName: "(unknown)" },
		]);
	});
});
