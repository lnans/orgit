import { existsSync } from "node:fs";
import path from "node:path";
import type {
	DeleteItemResult,
	DeleteWorktreeParams,
} from "../../../shared/delete-item";
import { logger } from "../../lib/logger";
import { removeDirectoryIfExists } from "./delete-path";
import { isRepositoryRoot } from "./git";
import { runGitAsync } from "./git/run";

/**
 * Remove a linked worktree from Git metadata and delete its checkout directory.
 */
export async function executeDeleteWorktree(
	params: DeleteWorktreeParams,
): Promise<DeleteItemResult> {
	const repositoryPath = path.resolve(params.repositoryPath);
	const worktreePath = path.resolve(params.worktreePath);

	if (!isRepositoryRoot(repositoryPath)) {
		return { ok: false, error: "invalid_repository" };
	}

	if (repositoryPath === worktreePath) {
		return { ok: false, error: "invalid_worktree" };
	}

	if (!existsSync(worktreePath)) {
		return { ok: false, error: "not_found" };
	}

	const result = await runGitAsync(repositoryPath, [
		"worktree",
		"remove",
		"--force",
		worktreePath,
	]);
	if (!result.ok) {
		logger.error(
			`git worktree remove failed (exit ${result.status}): ${result.stdout}`,
			result.args,
		);
		return {
			ok: false,
			error: "worktree_remove_failed",
			detail: result.stdout || undefined,
		};
	}

	removeDirectoryIfExists(worktreePath);
	return { ok: true };
}
