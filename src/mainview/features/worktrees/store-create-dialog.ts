import type { CreateWorktreeResult } from "@shared/create-worktree";
import { create } from "zustand";

export type CreateWorktreeDialogDefaults = {
	repositoryPath?: string;
};

type CreateWorktreeDialogStore = {
	open: boolean;
	defaults?: CreateWorktreeDialogDefaults;
	isSubmitting: boolean;
	submitError: CreateWorktreeResult | null;
	openDialog: (defaults?: CreateWorktreeDialogDefaults) => void;
	setOpen: (open: boolean) => void;
	setSubmitting: (isSubmitting: boolean) => void;
	setSubmitError: (error: CreateWorktreeResult | null) => void;
};

export const useCreateWorktreeDialogStore = create<CreateWorktreeDialogStore>()(
	(set) => ({
		open: false,
		defaults: undefined,
		isSubmitting: false,
		submitError: null,
		openDialog: (defaults) =>
			set((state) => ({
				open: true,
				defaults,
				submitError: null,
				isSubmitting: state.isSubmitting,
			})),
		setOpen: (open) => set({ open }),
		setSubmitting: (isSubmitting) => set({ isSubmitting }),
		setSubmitError: (submitError) => set({ submitError }),
	}),
);
