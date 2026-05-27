import path from "node:path";
import {
	EMPTY_WORKTREE_DIFF_STATS,
	type Worktree,
} from "../../../../shared/types";
import { logger } from "../../../lib/logger";
import { runGitAsync } from "../git";
import { getMainBaselineRef, getWorktreeDiffStats } from "./diff-stats";
import { parseWorktreePorcelain } from "./parse-porcelain";

export type ListWorktreesOptions = {
	includeDiffStats?: boolean;
};

export async function listWorktrees(
	repoPath: string,
	options: ListWorktreesOptions = {},
): Promise<Worktree[]> {
	const includeDiffStats = options.includeDiffStats ?? true;
	const result = await runGitAsync(repoPath, [
		"worktree",
		"list",
		"--porcelain",
	]);

	if (!result.ok) {
		logger.warn(
			`Unable to list worktrees for ${repoPath} (exit ${result.status})`,
		);
		return [];
	}

	return buildWorktrees(result.stdout, repoPath, includeDiffStats);
}

function buildWorktrees(
	output: string,
	mainRepoPath: string,
	includeDiffStats: boolean,
): Worktree[] {
	const worktrees: Worktree[] = [];
	const mainBaselineRef = includeDiffStats
		? getMainBaselineRef(mainRepoPath)
		: "";
	const resolvedMainRepoPath = path.resolve(mainRepoPath);

	for (const entry of parseWorktreePorcelain(output)) {
		if (path.resolve(entry.path) === resolvedMainRepoPath) {
			continue;
		}

		const diffStats = includeDiffStats
			? getWorktreeDiffStats(entry.path, mainBaselineRef)
			: EMPTY_WORKTREE_DIFF_STATS;

		worktrees.push({
			name: entry.branchName,
			path: path.resolve(entry.path),
			...diffStats,
		});
	}

	return worktrees.sort((a, b) => a.name.localeCompare(b.name));
}
