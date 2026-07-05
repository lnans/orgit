import { BrowserWindow, Updater } from "electrobun/bun";
import type { ILogger } from "@/server/types/server.types";

const DEV_SERVER_URL = "http://localhost:5173";
const MAIN_VIEW_URL = "views://mainview/index.html";

async function resolveMainViewUrl(logger: ILogger): Promise<string> {
	const channel = await Updater.localInfo.channel();
	if (channel === "dev") {
		try {
			await fetch(DEV_SERVER_URL, { method: "HEAD" });
			logger.info(`[Window] Using Vite dev server at ${DEV_SERVER_URL}`);
			return DEV_SERVER_URL;
		} catch {
			logger.info("[Window] Vite dev server not running. Run 'bun run dev:hmr' for HMR support.");
		}
	}
	return MAIN_VIEW_URL;
}

export async function createMainWindow(logger: ILogger) {
	const mainWindow = new BrowserWindow({
		title: "Orgit",
		url: await resolveMainViewUrl(logger),
		activate: true,
		frame: { width: 900, height: 700, x: 200, y: 200 },
		styleMask: {
			FullSizeContentView: true,
		},
		titleBarStyle: "hiddenInset",
	});

	return mainWindow;
}
