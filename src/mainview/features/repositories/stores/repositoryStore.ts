import { create } from "zustand";
import type { RepositoryDto } from "@/shared/types/RepositoryDto";

type RepositoryStore = {
	repositories: RepositoryDto[];
	actions: {
		setRepositories: (repositories: RepositoryDto[]) => void;
	};
};

export const useRepositoryStore = create<RepositoryStore>()((set) => ({
	repositories: [],
	actions: {
		setRepositories: (repositories) => set({ repositories }),
	},
}));
