import type { RepositoryDto } from "./RepositoryDto";

export type AppStatePersistedDto = {
	workspacePath: string;
};

export type AppStateDto = AppStatePersistedDto & {
	repositories: RepositoryDto[];
};
