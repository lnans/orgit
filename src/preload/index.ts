import { electronAPI } from "@electron-toolkit/preload";
import type { IpcRendererApi } from "@shared/interfaces/Ipc";
import { contextBridge, type IpcRendererEvent, ipcRenderer } from "electron";

const api: IpcRendererApi = {
	send: (channel, ...args) => ipcRenderer.send(channel, ...args),
	invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
	on: (channel, cb) => {
		const listener = (_: IpcRendererEvent, ...args: unknown[]) =>
			(cb as (...a: unknown[]) => void)(...args);
		ipcRenderer.on(channel, listener);
		return () => ipcRenderer.removeListener(channel, listener);
	},
};

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-expect-error (define in dts)
	window.electron = electronAPI;
	// @ts-expect-error (define in dts)
	window.api = api;
}
