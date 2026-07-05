import { setupApplicationMenu } from "./application-menu";
import { createMainWindow } from "./application-window";
import { Constants } from "./constants";
import { AppStateManager } from "./features/app-state-manager";
import { FsManager } from "./features/fs-manager";
import { GitManager } from "./features/git-manager";
import { Logger } from "./features/logger";

const fsManager = new FsManager();
const logger = new Logger(Constants.AppLogsFolderPath, fsManager).ensureReady();
const gitManager = new GitManager(logger, fsManager);
const appStateManager = new AppStateManager(
	logger,
	fsManager,
	Constants.AppStateFolderPath,
	Constants.AppStateDefaults,
);

async function shutdownWithError(err: unknown, message: string): Promise<never> {
	logger.error(message, err);
	await logger.ensureStopped();
	process.exit(1);
}

process.on("uncaughtException", (err) => {
	void shutdownWithError(err, "[MainProcess] Uncaught exception");
});

process.on("unhandledRejection", (reason) => {
	void shutdownWithError(reason, "[MainProcess] Unhandled promise rejection");
});

try {
	setupApplicationMenu();

	appStateManager.ensureReady();
	gitManager.scanGitRepositories(appStateManager.state.workspacePath);

	const mainWindow = await createMainWindow(logger);

	mainWindow.webview.on("dom-ready", async () => {
		mainWindow.maximize();
		mainWindow.activate();
		logger.info("[Window] Main view DOM is ready", appStateManager.state.workspacePath);
	});
} catch (err) {
	await shutdownWithError(err, "[MainProcess] An unhandled has error occurs");
}
