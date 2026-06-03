import { mainProcess } from "@client/rpc";
import { useAppStore } from "@client/store";
import type { CreateWorktreeParams } from "@shared/create-worktree";
import { useEffect } from "react";
import { useCreateWorktreeDialogStore } from "../store-create-dialog";
import { CreateWorktreeDialog } from "./create-worktree-dialog";

function CreateWorktreeDialogHost() {
	const repositories = useAppStore((state) => state.repositories);
	const open = useCreateWorktreeDialogStore((state) => state.open);
	const defaults = useCreateWorktreeDialogStore((state) => state.defaults);
	const isSubmitting = useCreateWorktreeDialogStore(
		(state) => state.isSubmitting,
	);
	const submitError = useCreateWorktreeDialogStore(
		(state) => state.submitError,
	);
	const setOpen = useCreateWorktreeDialogStore((state) => state.setOpen);
	const setSubmitting = useCreateWorktreeDialogStore(
		(state) => state.setSubmitting,
	);
	const setSubmitError = useCreateWorktreeDialogStore(
		(state) => state.setSubmitError,
	);

	useEffect(() => {
		return mainProcess.onCreateWorktreeResult((result) => {
			setSubmitting(false);
			if (result.ok) {
				setSubmitError(null);
				setOpen(false);
			} else {
				setSubmitError(result);
			}
		});
	}, [setOpen, setSubmitError, setSubmitting]);

	const submit = (params: CreateWorktreeParams) => {
		setSubmitError(null);
		setSubmitting(true);
		mainProcess.createWorktree(params);
	};

	return (
		<CreateWorktreeDialog
			open={open}
			onOpenChange={setOpen}
			repositories={repositories}
			defaults={defaults}
			onSubmit={submit}
			isSubmitting={isSubmitting}
			submitError={submitError}
		/>
	);
}

export { CreateWorktreeDialogHost };
