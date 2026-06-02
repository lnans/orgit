import { create } from "zustand";

type GitPullStore = {
	loadingKeys: ReadonlySet<string>;
	start: (loadingKey: string) => void;
	finish: (loadingKey: string) => void;
	isLoading: (loadingKey: string) => boolean;
};

export const useGitPullStore = create<GitPullStore>()((set, get) => ({
	loadingKeys: new Set(),
	start: (loadingKey) => {
		set((state) => {
			const next = new Set(state.loadingKeys);
			next.add(loadingKey);
			return { loadingKeys: next };
		});
	},
	finish: (loadingKey) => {
		set((state) => {
			if (!state.loadingKeys.has(loadingKey)) {
				return state;
			}
			const next = new Set(state.loadingKeys);
			next.delete(loadingKey);
			return { loadingKeys: next };
		});
	},
	isLoading: (loadingKey) => get().loadingKeys.has(loadingKey),
}));
