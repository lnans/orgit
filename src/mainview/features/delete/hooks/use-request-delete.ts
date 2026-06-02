import { useDeleteConfirmationStore } from "../store";

/** Opens the delete confirmation dialog for a repository or worktree. */
export function useRequestDelete() {
	return useDeleteConfirmationStore((state) => state.requestDelete);
}
