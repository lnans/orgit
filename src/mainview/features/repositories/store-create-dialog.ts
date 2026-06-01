import type { CreateRepositoryResult } from "@shared/create-repository";
import { create } from "zustand";

type CreateRepositoryDialogStore = {
	open: boolean;
	isSubmitting: boolean;
	submitError: CreateRepositoryResult | null;
	openDialog: () => void;
	setOpen: (open: boolean) => void;
	setSubmitting: (isSubmitting: boolean) => void;
	setSubmitError: (error: CreateRepositoryResult | null) => void;
};

export const useCreateRepositoryDialogStore =
	create<CreateRepositoryDialogStore>()((set) => ({
		open: false,
		isSubmitting: false,
		submitError: null,
		openDialog: () =>
			set((state) => ({
				open: true,
				submitError: null,
				isSubmitting: state.isSubmitting,
			})),
		setOpen: (open) => set({ open }),
		setSubmitting: (isSubmitting) => set({ isSubmitting }),
		setSubmitError: (submitError) => set({ submitError }),
	}));
