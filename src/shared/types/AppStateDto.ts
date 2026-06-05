import type { RepositoryDto } from "./RepositoryDto";

export type AppStatePersistedDto = {
	workspacePath: string;
	selectedRepositoryPath?: string;
	selectedWorktreePaths?: Record<string, string>;
};

export type AppStateDto = AppStatePersistedDto & {
	repositories: RepositoryDto[];
};
