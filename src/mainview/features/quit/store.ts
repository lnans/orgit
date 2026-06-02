import { create } from "zustand";

type QuitConfirmationStore = {
	open: boolean;
	requestOpen: () => void;
	dismiss: () => void;
};

export const useQuitConfirmationStore = create<QuitConfirmationStore>()(
	(set, get) => ({
		open: false,
		requestOpen: () => {
			if (get().open) {
				return;
			}
			set({ open: true });
		},
		dismiss: () => set({ open: false }),
	}),
);
