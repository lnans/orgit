import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { executeAddWorktree } from "./add-worktree";
import { runGitAsync } from "./git/run";

function runGit(cwd: string, args: string[]) {
	return Bun.spawnSync(["git", ...args], {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
}

function initTestRepo(repo: string) {
	runGit(repo, ["init"]);
	runGit(repo, ["config", "user.email", "orgit@test.local"]);
	runGit(repo, ["config", "user.name", "Orgit Test"]);
}

describe("executeAddWorktree", () => {
	test("returns invalid_branch_name for empty branch input", async () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "orgit-add-wt-"));
		try {
			const result = await executeAddWorktree(workspace, {
				repositoryPath: "/nonexistent",
				branchName: "   ",
			});
			expect(result).toEqual({ ok: false, error: "invalid_branch_name" });
		} finally {
			rmSync(workspace, { recursive: true, force: true });
		}
	});

	test("returns invalid_worktree_folder_name when checkout folder is too long", async () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "orgit-add-wt-"));
		try {
			const result = await executeAddWorktree(workspace, {
				repositoryPath: "/nonexistent",
				branchName: "x".repeat(300),
			});
			expect(result).toEqual({
				ok: false,
				error: "invalid_worktree_folder_name",
			});
		} finally {
			rmSync(workspace, { recursive: true, force: true });
		}
	});

	test("returns invalid_worktree_folder_name when combined folder exceeds segment limit", async () => {
		const root = mkdtempSync(path.join(tmpdir(), "orgit-add-wt-"));
		const longRepoName = "r".repeat(200);
		const repo = path.join(root, longRepoName);
		const workspace = path.join(root, "workspace");
		mkdirSync(repo, { recursive: true });
		mkdirSync(workspace, { recursive: true });
		runGit(repo, ["init"]);
		runGit(repo, ["checkout", "-b", "main"]);

		try {
			const result = await executeAddWorktree(workspace, {
				repositoryPath: repo,
				branchName: "a".repeat(100),
			});
			expect(result).toEqual({
				ok: false,
				error: "invalid_worktree_folder_name",
			});
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	test("adds a worktree from an existing remote branch", async () => {
		const root = mkdtempSync(path.join(tmpdir(), "orgit-add-wt-"));
		const repo = path.join(root, "my-repo");
		const bare = path.join(root, "bare.git");
		const workspace = path.join(root, "workspace");
		mkdirSync(repo, { recursive: true });
		mkdirSync(workspace, { recursive: true });

		runGit(root, ["init", "--bare", bare]);
		initTestRepo(repo);
		runGit(repo, ["checkout", "-b", "main"]);
		writeFileSync(path.join(repo, "README.md"), "hello\n");
		runGit(repo, ["add", "README.md"]);
		runGit(repo, ["commit", "-m", "init"]);
		runGit(repo, ["remote", "add", "origin", bare]);
		runGit(repo, ["push", "-u", "origin", "main"]);
		runGit(repo, ["checkout", "-b", "feature-remote"]);
		writeFileSync(path.join(repo, "feature.txt"), "feat\n");
		runGit(repo, ["add", "feature.txt"]);
		runGit(repo, ["commit", "-m", "feature"]);
		runGit(repo, ["push", "-u", "origin", "feature-remote"]);
		runGit(repo, ["checkout", "main"]);
		runGit(repo, ["fetch", "origin"]);

		try {
			const result = await executeAddWorktree(workspace, {
				mode: "existing",
				repositoryPath: repo,
				remoteBranch: "origin/feature-remote",
			});

			expect(result.ok).toBe(true);
			if (!result.ok || !result.paths) {
				throw new Error("expected success");
			}

			expect(result.paths.worktreePath).toBe(
				path.join(workspace, "my-repo-feature_dash_remote"),
			);

			const branchList = await runGitAsync(repo, [
				"worktree",
				"list",
				"--porcelain",
			]);
			expect(branchList.ok).toBe(true);
			expect(branchList.stdout).toContain("feature-remote");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	test("adds a worktree preserving branch casing", async () => {
		const root = mkdtempSync(path.join(tmpdir(), "orgit-add-wt-"));
		const repo = path.join(root, "my-repo");
		const workspace = path.join(root, "workspace");
		mkdirSync(repo, { recursive: true });
		mkdirSync(workspace, { recursive: true });

		initTestRepo(repo);
		runGit(repo, ["checkout", "-b", "main"]);
		writeFileSync(path.join(repo, "README.md"), "hello\n");
		runGit(repo, ["add", "README.md"]);
		runGit(repo, ["commit", "-m", "init"]);

		try {
			const result = await executeAddWorktree(workspace, {
				repositoryPath: repo,
				branchName: "Feature/One",
			});

			expect(result.ok).toBe(true);
			if (!result.ok || !result.paths) {
				throw new Error("expected success");
			}

			expect(result.paths.worktreePath).toBe(
				path.join(workspace, "my-repo-feature_slash_one"),
			);

			const branchList = await runGitAsync(repo, [
				"worktree",
				"list",
				"--porcelain",
			]);
			expect(branchList.ok).toBe(true);
			expect(branchList.stdout).toContain("Feature/One");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
