import type { Worktree } from "@shared/types";

/** True when the worktree has staged, unstaged, or untracked changes vs its branch HEAD. */
export function hasWorktreeChanges(worktree: Worktree): boolean {
	return (
		worktree.linesAdded > 0 ||
		worktree.linesRemoved > 0 ||
		worktree.filesModified > 0
	);
}
