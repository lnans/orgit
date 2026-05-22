import { mainProcess } from "@client/rpc";
import { getSelectedWorktreePath } from "@shared/selection";
import { type AppState, PERSISTED_STATE_VERSION } from "@shared/types";
import { create } from "zustand";

type AppStore = AppState & {
	syncAppState: (appState: AppState) => void;
	selectRepository: (path: string) => void;
	selectWorktree: (path: string) => void;
};

export const useAppStore = create<AppStore>()((set) => ({
	version: PERSISTED_STATE_VERSION,
	workspacePath: "",
	repositories: [],
	selectedRepositoryPath: undefined,
	selectedWorktreePaths: {},
	syncAppState: (appState) => set(() => ({ ...appState })),
	selectRepository: (path) => {
		mainProcess.onSelectRepository(path);
	},
	selectWorktree: (path) => {
		mainProcess.onSelectWorktree(path);
	},
}));

export function useSelectedRepository() {
	return useAppStore((state) =>
		state.repositories.find(
			(repository) => repository.path === state.selectedRepositoryPath,
		),
	);
}

export function useSelectedWorktreePath() {
	return useAppStore((state) => getSelectedWorktreePath(state));
}
