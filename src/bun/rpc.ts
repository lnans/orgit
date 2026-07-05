import { BrowserView, type BrowserWindow } from "electrobun";
import type { MainRPC } from "@/shared/types/MainRPC";

export function setupMainRpc() {
	let mainWindow: BrowserWindow | undefined;

	const mainRpc = BrowserView.defineRPC<MainRPC>({
		maxRequestTime: 5000,
		handlers: {
			messages: {
				onDoubleClickTitleBar: () => {
					if (!mainWindow) return;

					if (mainWindow.isMaximized()) {
						mainWindow.unmaximize();
					} else {
						mainWindow.maximize();
					}
				},
			},
		},
	});

	const setMainWindow = (window: BrowserWindow) => (mainWindow = window);

	return {
		mainRpc,
		setMainWindow,
	};
}
