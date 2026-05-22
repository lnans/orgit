import type { AppState } from "./types";

export function getSelectedWorktreePath(
	state: Pick<AppState, "selectedRepositoryPath" | "selectedWorktreePaths">,
): string | undefined {
	if (!state.selectedRepositoryPath) {
		return undefined;
	}

	return state.selectedWorktreePaths[state.selectedRepositoryPath];
}
