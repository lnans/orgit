export const ipc = {
	windowClose: () => window.api.send("window:close"),
	windowMinimize: () => window.api.send("window:minimize"),
	windowMaximize: () => window.api.send("window:maximize"),
};
