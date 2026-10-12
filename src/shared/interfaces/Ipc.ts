import type { BrowserWindow, IpcMainEvent } from "electron";

// renderer -> main (request/response)
// biome-ignore lint/suspicious/noEmptyInterface: wait implem
export interface IpcRendererInvokeMap {}

// renderer -> main, fire-and-forget (no return value)
export interface IpcRendererSendMap {
	"window:close": () => void;
	"window:minimize": () => void;
	"window:maximize": () => void;
}

// main -> renderer (push events)
// biome-ignore lint/suspicious/noEmptyInterface: wait implem
export interface IpcRendererEventMap {}

export interface IpcRendererApi {
	send: <K extends keyof IpcRendererSendMap>(
		channel: K,
		...args: Parameters<IpcRendererSendMap[K]>
	) => void;
	invoke: <K extends keyof IpcRendererInvokeMap>(
		channel: K,
		...args: Parameters<IpcRendererInvokeMap[K]>
	) => Promise<Awaited<ReturnType<IpcRendererInvokeMap[K]>>>;
	on: <K extends keyof IpcRendererEventMap>(
		channel: K,
		cb: IpcRendererEventMap[K],
	) => () => Electron.IpcRenderer;
}

export interface IpcMainApi {
	send: <K extends keyof IpcRendererEventMap>(
		win: BrowserWindow,
		channel: K,
		...args: Parameters<IpcRendererEventMap[K]>
	) => void;
	handle: <K extends keyof IpcRendererInvokeMap>(
		channel: K,
		fn: (
			e: Electron.IpcMainInvokeEvent,
			...args: Parameters<IpcRendererInvokeMap[K]>
		) =>
			| ReturnType<IpcRendererInvokeMap[K]>
			| Promise<ReturnType<IpcRendererInvokeMap[K]>>,
	) => void;
	on: <K extends keyof IpcRendererSendMap>(
		channel: K,
		fn: (e: IpcMainEvent, ...args: Parameters<IpcRendererSendMap[K]>) => void,
	) => void;
}
