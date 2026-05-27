import { Utils } from "electrobun/bun";
import { createAppState } from "./features/app-state/index";
import { createLogSync } from "./features/logs";
import { logger } from "./lib/logger";
import { createRpc } from "./rpc";
import { createMainWindow } from "./window";

export async function startApp() {
	const appState = createAppState();

	let logSync: ReturnType<typeof createLogSync>;

	const rpc = createRpc({
		onDoubleClickTitleBar: ({ mainWindow }) => {
			mainWindow.isMaximized()
				? mainWindow.unmaximize()
				: mainWindow.maximize();
		},
		onSelectRepository: ({ repositoryPath }) =>
			appState.selectRepository(repositoryPath),
		onSelectWorktree: ({ worktreePath }) =>
			appState.selectWorktree(worktreePath),
		onSetLogPanelOpen: ({ open }) => {
			if (open) {
				logSync.start();
			} else {
				logSync.stop();
			}
		},
	});

	logSync = createLogSync({
		onContent: (content) => rpc.syncLogContent(content),
	});

	const mainWindow = await createMainWindow(rpc);
	rpc.setMainWindow(mainWindow);

	mainWindow.on("close", () => Utils.quit());

	mainWindow.webview.on("dom-ready", async () => {
		rpc.syncAppState(await appState.initialize());
		rpc.syncAppState(await appState.refreshRepositories());
		logger.info("Main view is ready");
	});
}
