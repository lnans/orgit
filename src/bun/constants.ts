import { join } from "node:path";
import { Utils } from "electrobun";
import type { AppStatePersistedDto } from "@/shared/types/AppStateDto";

const AppDataDir = Utils.paths.userData;
const AppStateFolderPath = AppDataDir;
const AppWorkspaceFolderName = "workspace";
const AppWorkspaceFolderPath = join(AppDataDir, AppWorkspaceFolderName);
const AppLogsFolderName = "logs";
const AppLogsFolderPath = join(AppDataDir, AppLogsFolderName);

const AppStateDefaults = {
	workspacePath: AppWorkspaceFolderPath,
	selectedRepositoryPath: undefined,
	selectedWorktreePaths: undefined,
} satisfies AppStatePersistedDto;

export const Constants = {
	AppStateFolderPath,
	AppStateDefaults,
	AppLogsFolderPath,
} as const;
