import path from "node:path";
import { shallowEqualRecord } from "../../../shared/equality";
import { getSelectedWorktreePath } from "../../../shared/selection";
import type { AppState, SelectedWorktreePaths } from "../../../shared/types";

export function reconcileAppState(state: AppState): AppState {
	// Repositories not loaded yet (startup) — keep persisted selections intact.
	if (state.repositories.length === 0) {
		return { ...state };
	}

	const selectedWorktreePaths = pruneSelectedWorktreePaths(
		state.repositories,
		state.selectedWorktreePaths,
	);

	let selectedRepositoryPath = state.selectedRepositoryPath;
	if (selectedRepositoryPath) {
		const repository = findRepository(
			state.repositories,
			selectedRepositoryPath,
		);
		if (!repository) {
			selectedRepositoryPath = undefined;
		} else {
			selectedRepositoryPath = repository.path;
		}
	}

	const next: AppState = {
		...state,
		selectedWorktreePaths,
		selectedRepositoryPath,
	};

	const selectedWorktreePath = getSelectedWorktreePath(next);
	if (!selectedWorktreePath || !next.selectedRepositoryPath) {
		return next;
	}

	const repository = findRepository(
		next.repositories,
		next.selectedRepositoryPath,
	);
	const worktreeStillExists = repository?.worktrees.some((worktree) =>
		pathsEqual(worktree.path, selectedWorktreePath),
	);

	if (!worktreeStillExists) {
		const updated = { ...next.selectedWorktreePaths };
		delete updated[next.selectedRepositoryPath];
		return { ...next, selectedWorktreePaths: updated };
	}

	return next;
}

function pathsEqual(a: string, b: string): boolean {
	return path.resolve(a) === path.resolve(b);
}

function findRepository(
	repositories: AppState["repositories"],
	repositoryPath: string,
) {
	const resolved = path.resolve(repositoryPath);
	return repositories.find((repo) => path.resolve(repo.path) === resolved);
}

function pruneSelectedWorktreePaths(
	repositories: AppState["repositories"],
	selectedWorktreePaths: SelectedWorktreePaths,
): SelectedWorktreePaths {
	const pruned: SelectedWorktreePaths = {};

	for (const [repositoryPath, worktreePath] of Object.entries(
		selectedWorktreePaths,
	)) {
		const repository = findRepository(repositories, repositoryPath);
		if (!repository) {
			continue;
		}

		const worktree = repository.worktrees.find((entry) =>
			pathsEqual(entry.path, worktreePath),
		);
		if (worktree) {
			pruned[repository.path] = worktree.path;
		}
	}

	return pruned;
}

export function shouldPersistState(before: AppState, after: AppState): boolean {
	return (
		before.workspacePath !== after.workspacePath ||
		before.selectedRepositoryPath !== after.selectedRepositoryPath ||
		!shallowEqualRecord(
			before.selectedWorktreePaths,
			after.selectedWorktreePaths,
		)
	);
}
