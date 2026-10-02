import { join } from "node:path";
import { is } from "@electron-toolkit/utils";
import { BrowserWindow, shell } from "electron";

const icon = join(__dirname, "../../resources/icon.png").replace(
	"app.asar",
	"app.asar.unpacked",
);

export function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 1024,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
		titleBarStyle: "hiddenInset",
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.setWindowButtonVisibility(false);
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}
