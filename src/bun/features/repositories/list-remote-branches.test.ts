import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { listRemoteBranchesForWorktree } from "./list-remote-branches";

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

describe("listRemoteBranchesForWorktree", () => {
	test("returns invalid_repository for non-repo path", async () => {
		const result = await listRemoteBranchesForWorktree("/nonexistent");
		expect(result).toEqual({ ok: false, error: "invalid_repository" });
	});

	test("lists origin branches and excludes checked-out branches", async () => {
		const root = mkdtempSync(path.join(tmpdir(), "orgit-list-remote-"));
		const repo = path.join(root, "my-repo");
		const bare = path.join(root, "bare.git");
		mkdirSync(repo, { recursive: true });

		runGit(root, ["init", "--bare", bare]);
		initTestRepo(repo);
		runGit(repo, ["checkout", "-b", "main"]);
		writeFileSync(path.join(repo, "README.md"), "hello\n");
		runGit(repo, ["add", "README.md"]);
		runGit(repo, ["commit", "-m", "init"]);
		runGit(repo, ["remote", "add", "origin", bare]);
		runGit(repo, ["push", "-u", "origin", "main"]);
		runGit(repo, ["checkout", "-b", "feature-a"]);
		runGit(repo, ["push", "-u", "origin", "feature-a"]);
		runGit(repo, ["checkout", "main"]);
		runGit(repo, ["fetch", "origin"]);

		try {
			const result = await listRemoteBranchesForWorktree(repo);
			expect(result.ok).toBe(true);
			if (!result.ok) {
				throw new Error("expected success");
			}

			const refs = result.branches.map((branch) => branch.ref);
			expect(refs).toContain("origin/feature-a");
			expect(refs).not.toContain("origin/main");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
