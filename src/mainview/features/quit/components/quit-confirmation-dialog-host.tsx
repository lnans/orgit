import { mainProcess } from "@client/rpc";
import { useQuitConfirmationStore } from "../store";
import { QuitConfirmationDialog } from "./quit-confirmation-dialog";

function QuitConfirmationDialogHost() {
	const open = useQuitConfirmationStore((state) => state.open);
	const dismiss = useQuitConfirmationStore((state) => state.dismiss);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			return;
		}
		dismiss();
		mainProcess.cancelQuit();
	};

	const handleConfirm = () => {
		dismiss();
		mainProcess.confirmQuit();
	};

	return (
		<QuitConfirmationDialog
			open={open}
			onOpenChange={handleOpenChange}
			onConfirm={handleConfirm}
		/>
	);
}

export { QuitConfirmationDialogHost };
