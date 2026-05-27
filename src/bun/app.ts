import { Utils } from "electrobun/bun";
import { getSelectedWorktreePath } from "../shared/selection";
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
		onOutput: (data) => rpc.syncTerminalOutput(data),
		onExit: (exitCode) => rpc.syncTerminalExit(exitCode),
	});

	function terminalCwd() {
		const state = appState.get();
		return resolveTerminalCwd(
			state.workspacePath,
			getSelectedWorktreePath(state),
		);
	}

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
		onTerminalOpen: ({ cols, rows }) => {
			terminal.open({ cwd: terminalCwd(), cols, rows });
		},
		onTerminalInput: ({ data }) => {
			terminal.write(data);
		},
		onTerminalResize: ({ cols, rows }) => {
			terminal.resize(cols, rows);
		},
		onTerminalRestart: ({ cols, rows }) => {
			terminal.restart({ cwd: terminalCwd(), cols, rows });
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
