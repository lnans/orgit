import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type {
	CreateWorktreeParams,
	CreateWorktreeResult,
} from "../../../shared/create-worktree";
import {
	formatWorktreeFolderName,
	repositoryPathBasename,
	resolveWorktreeCheckout,
} from "../../../shared/worktree-checkout";
import { logger } from "../../lib/logger";
import { isRepositoryRoot } from "./git";
import { runGitAsync } from "./git/run";

export type AddWorktreeSuccess = {
	repositoryPath: string;
	worktreePath: string;
};

/**
 * Add a linked worktree on a new branch for an existing repository.
 */
export async function executeAddWorktree(
	workspacePath: string,
	params: CreateWorktreeParams,
): Promise<CreateWorktreeResult & { paths?: AddWorktreeSuccess }> {
	const repositoryBasename = repositoryPathBasename(params.repositoryPath);
	const resolved = resolveWorktreeCheckout(params.branchName, {
		repositoryBasename,
	});
	if (!resolved.ok) {
		return {
			ok: false,
			error:
				resolved.error.field === "branch"
					? "invalid_branch_name"
					: "invalid_worktree_folder_name",
		};
	}

	const repositoryPath = path.resolve(params.repositoryPath);
	if (!isRepositoryRoot(repositoryPath)) {
		return { ok: false, error: "invalid_repository" };
	}

	const worktreePath = path.join(
		workspacePath,
		formatWorktreeFolderName(
			repositoryPathBasename(repositoryPath),
			resolved.folderName,
		),
	);

	const branchName = resolved.branchName;

	const worktreeResult = await addWorktree(
		repositoryPath,
		branchName,
		worktreePath,
	);
	if (!worktreeResult.ok) {
		return worktreeResult;
	}

	return {
		ok: true,
		paths: { repositoryPath, worktreePath },
	};
}

async function addWorktree(
	repositoryPath: string,
	branchName: string,
	worktreePath: string,
): Promise<Extract<CreateWorktreeResult, { ok: false }> | { ok: true }> {
	if (existsSync(worktreePath)) {
		return { ok: false, error: "destination_exists" };
	}

	mkdirSync(path.dirname(worktreePath), { recursive: true });

	const result = await runGitAsync(repositoryPath, [
		"worktree",
		"add",
		"-b",
		branchName,
		worktreePath,
	]);
	if (!result.ok) {
		logger.error(
			`git worktree add failed (exit ${result.status}): ${result.stdout}`,
			result.args,
		);
		return {
			ok: false,
			error: "worktree_failed",
			detail: result.stdout || undefined,
		};
	}

	return { ok: true };
}
