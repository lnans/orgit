import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { executeCreateRepository } from "./create-repository";
import { isRepositoryRoot } from "./git";

function runGit(cwd: string, args: string[]) {
	return Bun.spawnSync(["git", ...args], {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
}

describe("executeCreateRepository", () => {
	test("returns invalid_repository_source for empty clone URL", async () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "orgit-create-repo-"));
		try {
			const result = await executeCreateRepository(workspace, {
				source: "   ",
				folderName: "my-repo",
			});
			expect(result).toEqual({ ok: false, error: "invalid_repository_source" });
		} finally {
			rmSync(workspace, { recursive: true, force: true });
		}
	});

	test("returns invalid_folder_name for invalid folder", async () => {
		const workspace = mkdtempSync(path.join(tmpdir(), "orgit-create-repo-"));
		try {
			const result = await executeCreateRepository(workspace, {
				source: "https://example.com/a.git",
				folderName: "   ",
			});
			expect(result).toEqual({ ok: false, error: "invalid_folder_name" });
		} finally {
			rmSync(workspace, { recursive: true, force: true });
		}
	});

	test("clones a repository into the chosen workspace folder", async () => {
		const root = mkdtempSync(path.join(tmpdir(), "orgit-create-repo-"));
		const origin = path.join(root, "origin");
		const workspace = path.join(root, "workspace");
		mkdirSync(origin, { recursive: true });
		mkdirSync(workspace, { recursive: true });

		runGit(origin, ["init"]);
		runGit(origin, ["checkout", "-b", "main"]);
		writeFileSync(path.join(origin, "README.md"), "hello\n");
		runGit(origin, ["add", "README.md"]);
		runGit(origin, ["commit", "-m", "init"]);

		const originUrl = `file://${origin}`;

		try {
			const result = await executeCreateRepository(workspace, {
				source: originUrl,
				folderName: "my-clone",
			});

			expect(result.ok).toBe(true);
			if (!result.ok || !result.paths) {
				throw new Error("expected success");
			}

			expect(result.paths.repositoryPath).toBe(
				path.join(workspace, "my-clone"),
			);
			expect(isRepositoryRoot(result.paths.repositoryPath)).toBe(true);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
