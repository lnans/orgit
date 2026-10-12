import type { IpcMainApi } from "@shared/interfaces/Ipc";
import { BrowserWindow, ipcMain } from "electron";

export const ipc: IpcMainApi = {
	send: (win, channel, ...args) => {
		win.webContents.send(channel, ...args);
	},
	handle: (channel, fn) => {
		ipcMain.handle(channel, fn);
	},
	on: (channel, fn) => {
		ipcMain.on(channel, fn);
	},
};

export function createIpcMain() {
	const getWindow = (e: Electron.IpcMainEvent) =>
		BrowserWindow.fromWebContents(e.sender);

	ipc.on("window:close", (e) => getWindow(e)?.close());
	ipc.on("window:minimize", (e) => getWindow(e)?.minimize());
	ipc.on("window:maximize", (e) => {
		const win = getWindow(e);
		if (!win) return;
		win.isMaximized() ? win.unmaximize() : win.maximize();
	});
}
