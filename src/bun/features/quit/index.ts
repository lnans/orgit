import Electrobun, { BrowserView, type BrowserWindow } from "electrobun/bun";

type QuitGuardOptions = {
	mainWindow: BrowserWindow;
	requestConfirmation: () => void;
	onConfirmedQuit: () => void;
};

/**
 * Intercepts quit attempts and asks the webview to confirm before cleanup and exit.
 *
 * Electrobun's default global `close` handler tears down the webview on window close.
 * We replace it so the webview stays alive until the user confirms.
 *
 * macOS begins hiding the window when the close button is clicked. The webview
 * AlertDialog is only visible if we show the window again after sending the RPC.
 */
export function createQuitGuard(options: QuitGuardOptions) {
	let quitConfirmed = false;
	const { mainWindow } = options;

	const isQuitConfirmed = () => quitConfirmed;

	const promptConfirmation = () => {
		if (quitConfirmed) {
			return;
		}
		options.requestConfirmation();
	};

	/** Red close button: native hide runs before JS; restore window so the dialog is visible. */
	const promptConfirmationAfterWindowClose = () => {
		if (quitConfirmed) {
			return;
		}
		promptConfirmation();
		queueMicrotask(() => {
			mainWindow.show();
			mainWindow.activate();
		});
	};

	const confirmQuit = () => {
		if (quitConfirmed) {
			return;
		}
		quitConfirmed = true;
		options.onConfirmedQuit();
	};

	const runDefaultCloseCleanup = (windowId: number) => {
		for (const view of BrowserView.getAll()) {
			if (view.windowId === windowId) {
				view.remove();
			}
		}
	};

	const install = () => {
		Electrobun.events.removeAllListeners("close");

		Electrobun.events.on("close", (event) => {
			if (event.data.id !== mainWindow.id) {
				return;
			}
			if (quitConfirmed) {
				runDefaultCloseCleanup(event.data.id);
				return;
			}
			promptConfirmationAfterWindowClose();
		});

		Electrobun.events.on("before-quit", (event) => {
			if (quitConfirmed) {
				return;
			}
			event.response = { allow: false };
			promptConfirmation();
		});
	};

	return {
		install,
		confirmQuit,
		isQuitConfirmed,
	};
}

export type QuitGuard = ReturnType<typeof createQuitGuard>;
