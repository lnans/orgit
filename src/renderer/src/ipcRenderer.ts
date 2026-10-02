export const IPC = {
	windowClose: () => window.electron.ipcRenderer.send("window:close"),
	windowMinimize: () => window.electron.ipcRenderer.send("window:minimize"),
	windowMaximize: () => window.electron.ipcRenderer.send("window:maximize"),
};
