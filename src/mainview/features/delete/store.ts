import { create } from "zustand";

export type DeleteConfirmationTarget =
	| {
			kind: "worktree";
			repositoryPath: string;
			worktreePath: string;
			label: string;
	  }
	| {
			kind: "repository";
			repositoryPath: string;
			label: string;
	  };

type DeleteConfirmationStore = {
	target: DeleteConfirmationTarget | null;
	isSubmitting: boolean;
	requestDelete: (target: DeleteConfirmationTarget) => void;
	dismiss: () => void;
	setSubmitting: (isSubmitting: boolean) => void;
};

export const useDeleteConfirmationStore = create<DeleteConfirmationStore>()(
	(set, get) => ({
		target: null,
		isSubmitting: false,
		requestDelete: (target) => {
			if (get().isSubmitting) {
				return;
			}
			set({ target, isSubmitting: false });
		},
		dismiss: () => {
			if (get().isSubmitting) {
				return;
			}
			set({ target: null });
		},
		setSubmitting: (isSubmitting) => set({ isSubmitting }),
	}),
);
