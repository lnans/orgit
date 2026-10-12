import type { WorktreeDto } from "./WorktreeDto";

export type RepositoryDto = {
	name: string;
	branch: string;
	path: string;
	worktrees: WorktreeDto[];
};
