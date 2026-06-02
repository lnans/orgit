import { mainProcess } from "@client/rpc";
import type { DeleteItemParams } from "@shared/delete-item";
import { useEffect } from "react";
import { useDeleteConfirmationStore } from "../store";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

function toDeleteItemParams(
	target: NonNullable<
		ReturnType<typeof useDeleteConfirmationStore.getState>["target"]
	>,
): DeleteItemParams {
	if (target.kind === "worktree") {
		return {
			kind: "worktree",
			repositoryPath: target.repositoryPath,
			worktreePath: target.worktreePath,
		};
	}

	return {
		kind: "repository",
		repositoryPath: target.repositoryPath,
	};
}

function DeleteConfirmationDialogHost() {
	const target = useDeleteConfirmationStore((state) => state.target);
	const isSubmitting = useDeleteConfirmationStore(
		(state) => state.isSubmitting,
	);
	const dismiss = useDeleteConfirmationStore((state) => state.dismiss);
	const setSubmitting = useDeleteConfirmationStore(
		(state) => state.setSubmitting,
	);

	useEffect(() => {
		return mainProcess.onDeleteItemResult((result) => {
			setSubmitting(false);
			if (result.ok) {
				dismiss();
			}
		});
	}, [dismiss, setSubmitting]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			return;
		}
		dismiss();
	};

	const handleConfirm = () => {
		if (!target || isSubmitting) {
			return;
		}
		setSubmitting(true);
		mainProcess.deleteItem(toDeleteItemParams(target));
	};

	return (
		<DeleteConfirmationDialog
			open={target !== null}
			target={target}
			isSubmitting={isSubmitting}
			onOpenChange={handleOpenChange}
			onConfirm={handleConfirm}
		/>
	);
}

export { DeleteConfirmationDialogHost };
