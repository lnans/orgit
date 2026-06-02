import { useCreateWorktreeDialogStore } from "@client/features/worktrees/store-create-dialog";
import { useAppStore } from "@client/store";
import { useEffect } from "react";

const CREATE_WORKTREE_KEYBOARD_SHORTCUT = "n";

export function useCreateWorktreeShortcut() {
	const selectedRepositoryPath = useAppStore(
		(state) => state.selectedRepositoryPath,
	);
	const openDialog = useCreateWorktreeDialogStore((state) => state.openDialog);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() !== CREATE_WORKTREE_KEYBOARD_SHORTCUT ||
				!(event.metaKey || event.ctrlKey)
			) {
				return;
			}

			event.preventDefault();
			openDialog(
				selectedRepositoryPath
					? { repositoryPath: selectedRepositoryPath }
					: undefined,
			);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [openDialog, selectedRepositoryPath]);
}
