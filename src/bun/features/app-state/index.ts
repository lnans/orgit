import type {
	CreateRepositoryParams,
	CreateRepositoryResult,
} from "../../../shared/create-repository";
import type {
	CreateWorktreeParams,
	CreateWorktreeResult,
} from "../../../shared/create-worktree";
import type { AppState } from "../../../shared/types";
import {
	executeAddWorktree,
	executeCreateRepository,
	type ListRepositoriesOptions,
	listRepositories,
} from "../repositories";
import {
	loadPersistedState,
	savePersistedState,
	toPersistedState,
} from "./persistence";
import { reconcileAppState, shouldPersistState } from "./reconcile";

export function createAppState() {
	const persisted = loadPersistedState();
	let state = reconcileAppState({
		...persisted,
		repositories: [],
	});

	function applyState(next: AppState): AppState {
		const previous = state;
		state = reconcileAppState(next);

		if (shouldPersistState(previous, state)) {
			savePersistedState(toPersistedState(state));
		}

		return structuredClone(state);
	}

	async function loadRepositories(
		options?: ListRepositoriesOptions,
	): Promise<AppState> {
		return applyState({
			...state,
			repositories: await listRepositories(state.workspacePath, options),
		});
	}

	return {
		get(): AppState {
			return structuredClone(state);
		},

		/** Fast scan without per-worktree diff stats. */
		async initialize(): Promise<AppState> {
			return loadRepositories({ includeDiffStats: false });
		},

		/** Full scan with diff stats (call after initialize for complete UI). */
		async refreshRepositories(): Promise<AppState> {
			return loadRepositories({ includeDiffStats: true });
		},

		selectRepository(repositoryPath: string | null | undefined): AppState {
			return applyState({
				...state,
				selectedRepositoryPath: repositoryPath ?? undefined,
			});
		},

		selectWorktree(worktreePath: string | null | undefined): AppState {
			if (!state.selectedRepositoryPath) {
				return structuredClone(state);
			}

			const selectedWorktreePaths = { ...state.selectedWorktreePaths };
			if (worktreePath) {
				selectedWorktreePaths[state.selectedRepositoryPath] = worktreePath;
			} else {
				delete selectedWorktreePaths[state.selectedRepositoryPath];
			}

			return applyState({
				...state,
				selectedWorktreePaths,
			});
		},

		/** Clone into the workspace, rescan, and select the new repository. */
		async createRepository(
			params: CreateRepositoryParams,
		): Promise<CreateRepositoryResult> {
			const outcome = await executeCreateRepository(
				state.workspacePath,
				params,
			);
			if (!outcome.ok || !outcome.paths) {
				const { paths: _paths, ...result } = outcome;
				return result;
			}

			const { repositoryPath } = outcome.paths;
			const withRepos = await loadRepositories({ includeDiffStats: true });

			applyState({
				...withRepos,
				selectedRepositoryPath: repositoryPath,
			});

			return { ok: true };
		},

		/** Add a worktree, rescan, and select the new checkout. */
		async createWorktree(
			params: CreateWorktreeParams,
		): Promise<CreateWorktreeResult> {
			const outcome = await executeAddWorktree(state.workspacePath, params);
			if (!outcome.ok || !outcome.paths) {
				const { paths: _paths, ...result } = outcome;
				return result;
			}

			const { repositoryPath, worktreePath } = outcome.paths;
			const withRepos = await loadRepositories({ includeDiffStats: true });

			applyState({
				...withRepos,
				selectedRepositoryPath: repositoryPath,
				selectedWorktreePaths: {
					...withRepos.selectedWorktreePaths,
					[repositoryPath]: worktreePath,
				},
			});

			return { ok: true };
		},
	};
}
