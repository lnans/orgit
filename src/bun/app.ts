import { Utils } from "electrobun/bun";
import { getSelectedWorktreePath } from "../shared/selection";
import { DEFAULT_TERMINAL_SESSION_KEY } from "../shared/terminal";
import { createAppState } from "./features/app-state/index";
import { createConfigSync } from "./features/config";
import { createLogSync } from "./features/logs";
import { createTerminalManager, resolveTerminalCwd } from "./features/terminal";
import { logger } from "./lib/logger";
import { createRpc } from "./rpc";
import { createMainWindow } from "./window";

export async function startApp() {
	const appState = createAppState();

	let logSync: ReturnType<typeof createLogSync>;

	const terminal = createTerminalManager({
		onOutput: (sessionKey, data) => rpc.syncTerminalOutput(sessionKey, data),
		onExit: (sessionKey, exitCode) =>
			rpc.syncTerminalExit(sessionKey, exitCode),
	});

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
		onTerminalAttach: ({ sessionKey, cols, rows }) => {
			const state = appState.get();
			const cwd =
				sessionKey === DEFAULT_TERMINAL_SESSION_KEY
					? resolveTerminalCwd(
							state.workspacePath,
							getSelectedWorktreePath(state),
						)
					: sessionKey;
			terminal.attach({ sessionKey, cwd, cols, rows });
		},
		onTerminalInput: ({ sessionKey, data }) => {
			terminal.write(sessionKey, data);
		},
		onTerminalResize: ({ cols, rows }) => {
			terminal.resize(cols, rows);
		},
	});

	logSync = createLogSync({
		onContent: (content) => rpc.syncLogContent(content),
	});

	const configSync = createConfigSync({
		onConfig: (config) => rpc.syncAppConfig(config),
	});

	const mainWindow = await createMainWindow(rpc);
	rpc.setMainWindow(mainWindow);

	mainWindow.on("close", () => {
		configSync.stop();
		terminal.dispose();
		Utils.quit();
	});

	mainWindow.webview.on("dom-ready", async () => {
		mainWindow.activate();
		configSync.start();
		rpc.syncAppState(await appState.initialize());
		rpc.syncAppState(await appState.refreshRepositories());
		logger.info("Main view is ready");
	});
}
