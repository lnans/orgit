import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@client/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import type { DeleteConfirmationTarget } from "../store";

type DeleteConfirmationDialogProps = {
	open: boolean;
	target: DeleteConfirmationTarget | null;
	isSubmitting: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

function DeleteConfirmationDialog({
	open,
	target,
	isSubmitting,
	onOpenChange,
	onConfirm,
}: DeleteConfirmationDialogProps) {
	const { t } = useTranslation();

	if (!target) {
		return null;
	}

	const titleKey =
		target.kind === "worktree"
			? "deleteConfirmation.worktree.title"
			: "deleteConfirmation.repository.title";
	const descriptionKey =
		target.kind === "worktree"
			? "deleteConfirmation.worktree.description"
			: "deleteConfirmation.repository.description";

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t(titleKey, { name: target.label })}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{t(descriptionKey, { name: target.label })}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSubmitting}>
						{t("deleteConfirmation.cancel")}
					</AlertDialogCancel>
					<AlertDialogAction
						type="button"
						variant="destructive"
						disabled={isSubmitting}
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{t("deleteConfirmation.confirm")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export { DeleteConfirmationDialog };
