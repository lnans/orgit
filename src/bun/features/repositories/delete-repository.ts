import path from "node:path";
import type {
	DeleteItemResult,
	DeleteRepositoryParams,
} from "../../../shared/delete-item";
import { logger } from "../../lib/logger";
import { removeDirectoryIfExists } from "./delete-path";
import { isRepositoryRoot } from "./git";
import { runGitAsync } from "./git/run";
import { parseWorktreePorcelain } from "./worktrees/parse-porcelain";

/**
 * Remove all linked worktrees, then delete the repository directory from disk.
 */
export async function executeDeleteRepository(
	params: DeleteRepositoryParams,
): Promise<DeleteItemResult> {
	const repositoryPath = path.resolve(params.repositoryPath);

	if (!isRepositoryRoot(repositoryPath)) {
		return { ok: false, error: "invalid_repository" };
	}

	const linkedWorktreePaths = await listLinkedWorktreePaths(repositoryPath);
	for (const worktreePath of linkedWorktreePaths) {
		const removeResult = await runGitAsync(repositoryPath, [
			"worktree",
			"remove",
			"--force",
			worktreePath,
		]);
		if (!removeResult.ok) {
			logger.error(
				`git worktree remove failed (exit ${removeResult.status}): ${removeResult.stdout}`,
				removeResult.args,
			);
			return {
				ok: false,
				error: "worktree_remove_failed",
				detail: removeResult.stdout || undefined,
			};
		}
		removeDirectoryIfExists(worktreePath);
	}

	try {
		removeDirectoryIfExists(repositoryPath);
	} catch (error) {
		logger.error(
			`Failed to delete repository directory ${repositoryPath}.`,
			error,
		);
		return { ok: false, error: "repository_remove_failed" };
	}

	return { ok: true };
}

async function listLinkedWorktreePaths(
	repositoryPath: string,
): Promise<string[]> {
	const result = await runGitAsync(repositoryPath, [
		"worktree",
		"list",
		"--porcelain",
	]);
	if (!result.ok) {
		logger.warn(
			`Unable to list worktrees for ${repositoryPath} (exit ${result.status})`,
		);
		return [];
	}

	const resolvedRepositoryPath = path.resolve(repositoryPath);
	return parseWorktreePorcelain(result.stdout)
		.map((entry) => path.resolve(entry.path))
		.filter((worktreePath) => worktreePath !== resolvedRepositoryPath);
}
