import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow } from "electron";
import { Constants } from "./constants";
import { FsManager } from "./features/fsManager";
import { Logger } from "./features/logger";
import { createIpcMain } from "./ipcMain";
import { createWindow } from "./window";

const fsManager = new FsManager((path, e) => console.error(path, e));
const logger = new Logger(Constants.appLogs, fsManager);

app.whenReady().then(async () => {
	await logger.ensureReady();
	logger.info("[Main] app ready");

	electronApp.setAppUserModelId(Constants.appId);

	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createIpcMain();
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	logger.info("[Main] closing app...");
	app.quit();
});

let closing = false;
app.on("before-quit", (event) => {
	if (closing) return;
	event.preventDefault();
	closing = true;
	logger
		.ensureStopped()
		.then(() => fsManager.closeAll())
		.finally(() => app.quit());
});
