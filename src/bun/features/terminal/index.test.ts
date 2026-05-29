import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { Repository } from "../../../shared/types";
import {
	findScannedWorktreePath,
	resolveTerminalAttachCwd,
	resolveTerminalCwd,
} from "./index";

function repositoryWithWorktree(
	repositoryPath: string,
	worktreePath: string,
	worktreeName = "feature",
): Repository {
	return {
		name: "repo",
		path: repositoryPath,
		branch: "main",
		worktrees: [
			{
				name: worktreeName,
				path: worktreePath,
				filesModified: 0,
				linesAdded: 0,
				linesRemoved: 0,
			},
		],
	};
}

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

describe("findScannedWorktreePath", () => {
	test("matches worktree paths from the repository scan", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const worktree = join(workspace, "linked-worktree");
		const repositories = [repositoryWithWorktree(repository, worktree)];

		expect(findScannedWorktreePath(repositories, worktree)).toBe(
			resolve(worktree),
		);
	});

	test("matches branch names containing slashes", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const worktree = mkdtempSync(join(workspace, "wt-"));
		const repositories = [
			repositoryWithWorktree(repository, worktree, "feature/my-branch"),
		];

		expect(
			findScannedWorktreePath(repositories, "feature/my-branch", repository),
		).toBe(worktree);
	});
});

describe("resolveTerminalAttachCwd", () => {
	test("uses tab worktree path instead of repository root", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const worktree = mkdtempSync(join(workspace, "wt-"));

		expect(
			resolveTerminalAttachCwd({
				workspacePath: workspace,
				tabCwd: worktree,
				selectedWorktreePath: worktree,
				repositoryPath: repository,
				repositories: [repositoryWithWorktree(repository, worktree)],
			}),
		).toBe(worktree);
	});

	test("resolves branch name to scanned worktree path", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const worktree = mkdtempSync(join(workspace, "wt-"));

		expect(
			resolveTerminalAttachCwd({
				workspacePath: workspace,
				tabCwd: "feature/my-branch",
				selectedWorktreePath: undefined,
				repositoryPath: repository,
				repositories: [
					repositoryWithWorktree(repository, worktree, "feature/my-branch"),
				],
			}),
		).toBe(worktree);
	});

	test("falls back to repository when scanned worktree directory is missing", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const worktree = join(workspace, "linked-worktree-not-created");
		const repositories = [repositoryWithWorktree(repository, worktree)];

		expect(
			resolveTerminalAttachCwd({
				workspacePath: workspace,
				tabCwd: worktree,
				selectedWorktreePath: worktree,
				repositoryPath: repository,
				repositories,
			}),
		).toBe(repository);
	});

	test("falls back to repository when worktree path is unknown", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const missingWorktree = join(workspace, "missing-worktree");

		expect(
			resolveTerminalAttachCwd({
				workspacePath: workspace,
				tabCwd: missingWorktree,
				selectedWorktreePath: undefined,
				repositoryPath: repository,
				repositories: [],
			}),
		).toBe(repository);
	});

	test("resolves stale persisted path via branch basename", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const repository = mkdtempSync(join(workspace, "repo-"));
		const worktree = mkdtempSync(join(workspace, "actual-checkout-"));
		const stalePath = join(workspace, "config-macos-4");
		const repositories = [
			repositoryWithWorktree(repository, worktree, "config-macos-4"),
		];

		expect(
			resolveTerminalAttachCwd({
				workspacePath: workspace,
				tabCwd: stalePath,
				selectedWorktreePath: stalePath,
				repositoryPath: repository,
				repositories,
			}),
		).toBe(worktree);
	});

	test("falls back to selected worktree when tab cwd is empty", () => {
		const workspace = mkdtempSync(join(homedir(), "orgit-ws-"));
		const worktree = mkdtempSync(join(workspace, "wt-"));

		expect(
			resolveTerminalAttachCwd({
				workspacePath: workspace,
				tabCwd: "",
				selectedWorktreePath: worktree,
				repositoryPath: workspace,
				repositories: [repositoryWithWorktree(workspace, worktree)],
			}),
		).toBe(worktree);
	});
});
