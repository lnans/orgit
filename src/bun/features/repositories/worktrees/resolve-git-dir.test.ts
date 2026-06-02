import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	listGitMetadataWatchTargets,
	listWorktreeWatchTargets,
	resolveGitDir,
} from "./resolve-git-dir";

describe("resolveGitDir", () => {
	let tempDir: string;

	afterEach(() => {
		if (tempDir) {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	test("returns .git directory for a main checkout", () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "orgit-gitdir-"));
		const checkout = path.join(tempDir, "repo");
		mkdirSync(path.join(checkout, ".git"), { recursive: true });

		expect(resolveGitDir(checkout)).toBe(path.join(checkout, ".git"));
	});

	test("follows gitdir file for a linked worktree", () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "orgit-gitdir-"));
		const mainGit = path.join(tempDir, "main.git");
		const worktreeGit = path.join(mainGit, "worktrees", "feature");
		mkdirSync(worktreeGit, { recursive: true });
		writeFileSync(path.join(worktreeGit, "index"), "");

		const checkout = path.join(tempDir, "feature-wt");
		mkdirSync(checkout, { recursive: true });
		writeFileSync(path.join(checkout, ".git"), `gitdir: ${worktreeGit}\n`);

		expect(resolveGitDir(checkout)).toBe(worktreeGit);
	});

	test("returns null when .git is missing", () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "orgit-gitdir-"));
		const checkout = path.join(tempDir, "repo");
		mkdirSync(checkout, { recursive: true });

		expect(resolveGitDir(checkout)).toBeNull();
	});
});

describe("listWorktreeWatchTargets", () => {
	let tempDir: string;

	afterEach(() => {
		if (tempDir) {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	test("includes checkout and existing metadata files", () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "orgit-watch-"));
		const checkout = path.join(tempDir, "wt");
		const gitDir = path.join(checkout, ".git");
		mkdirSync(path.join(gitDir, "logs"), { recursive: true });
		writeFileSync(path.join(gitDir, "index"), "");
		writeFileSync(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n");
		writeFileSync(path.join(gitDir, "logs", "HEAD"), "");

		const resolvedCheckout = path.resolve(checkout);
		expect(listWorktreeWatchTargets(checkout)).toEqual([
			resolvedCheckout,
			path.join(gitDir, "index"),
			path.join(gitDir, "HEAD"),
			path.join(gitDir, "logs/HEAD"),
		]);
	});

	test("listGitMetadataWatchTargets skips missing files", () => {
		tempDir = mkdtempSync(path.join(tmpdir(), "orgit-watch-"));
		const gitDir = path.join(tempDir, "git");
		mkdirSync(gitDir, { recursive: true });
		writeFileSync(path.join(gitDir, "index"), "");

		expect(listGitMetadataWatchTargets(gitDir)).toEqual([
			path.join(gitDir, "index"),
		]);
	});
});
