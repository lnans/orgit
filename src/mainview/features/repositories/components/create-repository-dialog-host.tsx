import { mainProcess } from "@client/rpc";
import { useEffect } from "react";
import {
	type CreateRepositoryFormValues,
	toCreateRepositoryParams,
} from "../lib/create-repository-form-schema";
import { useCreateRepositoryDialogStore } from "../store-create-dialog";
import { CreateRepositoryDialog } from "./create-repository-dialog";

function CreateRepositoryDialogHost() {
	const open = useCreateRepositoryDialogStore((state) => state.open);
	const isSubmitting = useCreateRepositoryDialogStore(
		(state) => state.isSubmitting,
	);
	const submitError = useCreateRepositoryDialogStore(
		(state) => state.submitError,
	);
	const setOpen = useCreateRepositoryDialogStore((state) => state.setOpen);
	const setSubmitting = useCreateRepositoryDialogStore(
		(state) => state.setSubmitting,
	);
	const setSubmitError = useCreateRepositoryDialogStore(
		(state) => state.setSubmitError,
	);

	useEffect(() => {
		return mainProcess.onCreateRepositoryResult((result) => {
			setSubmitting(false);
			if (result.ok) {
				setSubmitError(null);
				setOpen(false);
			} else {
				setSubmitError(result);
			}
		});
	}, [setOpen, setSubmitError, setSubmitting]);

	const submit = (values: CreateRepositoryFormValues) => {
		setSubmitError(null);
		setSubmitting(true);
		mainProcess.createRepository(toCreateRepositoryParams(values));
	};

	return (
		<CreateRepositoryDialog
			open={open}
			onOpenChange={setOpen}
			onSubmit={submit}
			isSubmitting={isSubmitting}
			submitError={submitError}
		/>
	);
}

export { CreateRepositoryDialogHost };
