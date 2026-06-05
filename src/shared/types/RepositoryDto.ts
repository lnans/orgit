import type { WorktreeDto } from "./WorktreeDto";

export type RepositoryDto = {
	name: string;
	path: string;
	branch: string;
	worktrees: WorktreeDto[];
};
