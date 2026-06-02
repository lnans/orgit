import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { executeDeleteWorktree } from "./delete-worktree";

describe("executeDeleteWorktree", () => {
	test("returns invalid_repository for unknown repository root", async () => {
		const result = await executeDeleteWorktree({
			kind: "worktree",
			repositoryPath: "/nonexistent/repo",
			worktreePath: "/nonexistent/worktree",
		});
		expect(result).toEqual({ ok: false, error: "invalid_repository" });
	});

	test("returns invalid_worktree when path equals repository root", async () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "orgit-del-wt-"));
		const repo = path.join(workspace, "repo");
		mkdirSync(repo, { recursive: true });
		try {
			Bun.spawnSync(["git", "init"], { cwd: repo, stdout: "pipe" });
			const result = await executeDeleteWorktree({
				kind: "worktree",
				repositoryPath: repo,
				worktreePath: repo,
			});
			expect(result).toEqual({ ok: false, error: "invalid_worktree" });
		} finally {
			rmSync(workspace, { recursive: true, force: true });
		}
	});

	test("returns not_found when worktree directory is missing", async () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "orgit-del-wt-"));
		const repo = path.join(workspace, "repo");
		mkdirSync(repo, { recursive: true });
		try {
			Bun.spawnSync(["git", "init"], { cwd: repo, stdout: "pipe" });
			const result = await executeDeleteWorktree({
				kind: "worktree",
				repositoryPath: repo,
				worktreePath: path.join(workspace, "missing"),
			});
			expect(result).toEqual({ ok: false, error: "not_found" });
		} finally {
			rmSync(workspace, { recursive: true, force: true });
		}
	});
});
