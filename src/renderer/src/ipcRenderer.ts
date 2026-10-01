export const IPC = {
	ping: () => window.electron.ipcRenderer.send("ping"),
};
