import { Utils } from "electrobun/bun";
import { getSelectedWorktreePath } from "../shared/selection";
import { setupApplicationMenu } from "./application-menu";
import { createAppState } from "./features/app-state/index";
import { createConfigSync } from "./features/config";
import { createLogSync } from "./features/logs";
import { createQuitGuard } from "./features/quit";
import {
	createWorktreeStatusSync,
	listRemoteBranchesForWorktree,
} from "./features/repositories";
import {
	createTerminalManager,
	resolveTerminalAttachCwd,
} from "./features/terminal";
import {
	checkWorktreeHasDotNetSolution,
	openWorktreeInCode,
	openWorktreeInRider,
} from "./features/worktree-ide";
import { logger } from "./lib/logger";
import { createRpc } from "./rpc";
import { createMainWindow } from "./window";

export async function startApp() {
	setupApplicationMenu();
	const worktreeStatusSync = createWorktreeStatusSync({
		onChange: (worktreePaths) => {
			rpc.syncAppState(appState.refreshWorktreeDiffStats(worktreePaths));
		},
	});

	const appState = createAppState({
		onRepositoriesChanged: (repositories) => {
			worktreeStatusSync.sync(repositories);
		},
	});

	let logSync: ReturnType<typeof createLogSync>;

	const terminal = createTerminalManager({
		onOutput: (sessionId, data) => rpc.syncTerminalOutput(sessionId, data),
		onExit: (sessionId, exitCode) => rpc.syncTerminalExit(sessionId, exitCode),
	});

	let quitGuard: ReturnType<typeof createQuitGuard>;

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
		onTerminalAttach: ({ sessionId, cwd, cols, rows }) => {
			const state = appState.get();
			terminal.attach({
				sessionId,
				cwd: resolveTerminalAttachCwd({
					workspacePath: state.workspacePath,
					tabCwd: cwd,
					selectedWorktreePath: getSelectedWorktreePath(state),
					repositoryPath: state.selectedRepositoryPath,
					repositories: state.repositories,
				}),
				cols,
				rows,
			});
		},
		onTerminalClose: ({ sessionId }) => {
			terminal.close(sessionId);
		},
		onTerminalInput: ({ sessionId, data }) => {
			terminal.write(sessionId, data);
		},
		onTerminalResize: ({ cols, rows }) => {
			terminal.resize(cols, rows);
		},
		onCreateRepository: async (params) => {
			const result = await appState.createRepository(params);
			rpc.syncCreateRepositoryResult(result);
			if (result.ok) {
				rpc.syncAppState(appState.get());
			}
		},
		onCreateWorktree: async (params) => {
			const result = await appState.createWorktree(params);
			rpc.syncCreateWorktreeResult(result);
			if (result.ok) {
				rpc.syncAppState(appState.get());
			}
		},
		onGitPull: async ({ checkoutPath, loadingKey }) => {
			const result = await appState.gitPull(checkoutPath);
			if (result.ok) {
				rpc.syncAppState(appState.get());
			}
			rpc.syncGitPullResult(loadingKey, result);
		},
		onWindowFocused: ({ focused }) => {
			worktreeStatusSync.setActive(focused);
			if (focused) {
				rpc.syncAppState(appState.refreshWorktreeDiffStats());
			}
		},
		onConfirmQuit: () => {
			quitGuard.confirmQuit();
		},
		onCancelQuit: () => {},
		onDeleteItem: async (params) => {
			const result = await appState.deleteItem(params);
			if (result.ok) {
				rpc.syncAppState(appState.get());
			}
			rpc.syncDeleteItemResult(result);
		},
		worktreeHasDotNetSolution: checkWorktreeHasDotNetSolution,
		listRemoteBranchesForWorktree: (params) =>
			listRemoteBranchesForWorktree(params.repositoryPath),
		onOpenInCode: openWorktreeInCode,
		onOpenInRider: openWorktreeInRider,
	});

	logSync = createLogSync({
		onContent: (content) => rpc.syncLogContent(content),
	});

	const configSync = createConfigSync({
		onConfig: (config) => rpc.syncAppConfig(config),
	});

	const mainWindow = await createMainWindow(rpc);
	rpc.setMainWindow(mainWindow);

	quitGuard = createQuitGuard({
		mainWindow,
		requestConfirmation: () => rpc.syncQuitConfirmationRequest(),
		onConfirmedQuit: () => {
			configSync.stop();
			worktreeStatusSync.stop();
			terminal.dispose();
			Utils.quit();
		},
	});
	quitGuard.install();

	mainWindow.webview.on("dom-ready", async () => {
		mainWindow.activate();
		configSync.start();
		rpc.syncAppState(await appState.initialize());
		rpc.syncAppState(await appState.refreshRepositories());
		logger.info("Main view is ready");
	});
}
