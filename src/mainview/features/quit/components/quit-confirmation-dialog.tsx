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

type QuitConfirmationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

function QuitConfirmationDialog({
	open,
	onOpenChange,
	onConfirm,
}: QuitConfirmationDialogProps) {
	const { t } = useTranslation();

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("quitConfirmation.title")}</AlertDialogTitle>
					<AlertDialogDescription>
						{t("quitConfirmation.description")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{t("quitConfirmation.cancel")}</AlertDialogCancel>
					<AlertDialogAction
						type="button"
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{t("quitConfirmation.confirm")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export { QuitConfirmationDialog };
