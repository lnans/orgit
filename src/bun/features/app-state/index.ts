import type { AppState } from "../../../shared/types";
import {
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
	};
}
