import type { RepositoryDto } from "@shared/types/RepositoryDto";
import { create } from "zustand";

type RepositoryStore = {
	repositories: RepositoryDto[];
};

const repositoryStore = create<RepositoryStore>()(() => ({
	repositories: [
		{
			name: "repo-1",
			branch: "main",
			path: "/fake",
			worktrees: [
				{
					branch: "feature/new-feature-1",
					path: "/path1",
				},
				{
					branch: "feature/new-feature-2",
					path: "/path2",
				},
			],
		},
		{
			name: "repo-2",
			branch: "main",
			path: "/fake2",
			worktrees: [
				{
					branch: "feature/new-feature-1",
					path: "/path3",
				},
				{
					branch: "feature/new-feature-2",
					path: "/path4",
				},
			],
		},
	],
}));

export const useRepositories = () =>
	repositoryStore((state) => state.repositories);
