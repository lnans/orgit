import { create } from "zustand";

type TerminalStore = {
	writer: ((data: string) => void) | null;
	exitHandler: ((exitCode: number) => void) | null;
	setWriter: (writer: ((data: string) => void) | null) => void;
	setExitHandler: (handler: ((exitCode: number) => void) | null) => void;
	appendOutput: (data: string) => void;
	notifyExit: (exitCode: number) => void;
};

export const useTerminalStore = create<TerminalStore>()((set, get) => ({
	writer: null,
	exitHandler: null,
	setWriter: (writer) => set({ writer }),
	setExitHandler: (exitHandler) => set({ exitHandler }),
	appendOutput: (data) => {
		get().writer?.(data);
	},
	notifyExit: (exitCode) => {
		get().exitHandler?.(exitCode);
	},
}));
