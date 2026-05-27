import { mainProcess } from "@client/rpc";
import { create } from "zustand";

type LogStore = {
	open: boolean;
	content: string;
	toggle: () => void;
	setOpen: (open: boolean) => void;
	setContent: (content: string) => void;
};

function notifyMain(open: boolean) {
	mainProcess.setLogPanelOpen(open);
}

export const useLogStore = create<LogStore>()((set, get) => ({
	open: false,
	content: "",
	toggle: () => {
		const open = !get().open;
		notifyMain(open);
		set({ open });
	},
	setOpen: (open) => {
		if (open !== get().open) {
			notifyMain(open);
		}
		set({ open });
	},
	setContent: (content) => set({ content }),
}));
