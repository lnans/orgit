import { BrowserWindow, ipcMain } from "electron";

export function createIpcMain() {
	const getCurrentWindow = () => BrowserWindow.getFocusedWindow();

	ipcMain.on("window:close", () => getCurrentWindow()?.close());
	ipcMain.on("window:minimize", () => getCurrentWindow()?.minimize());
	ipcMain.on("window:maximize", () => {
		const window = getCurrentWindow();
		window?.isMaximized() ? window?.unmaximize() : window?.maximize();
	});
}
