import { create } from "zustand";

type SessionHandlers = {
	write: (data: string) => void;
	onExit: (exitCode: number) => void;
};

type TerminalStore = {
	openedSessionKeys: string[];
	openSession: (sessionKey: string) => void;
	sessions: Record<string, SessionHandlers>;
	registerSession: (sessionKey: string, handlers: SessionHandlers) => void;
	unregisterSession: (sessionKey: string) => void;
	appendOutput: (sessionKey: string, data: string) => void;
	notifyExit: (sessionKey: string, exitCode: number) => void;
};

export const useTerminalStore = create<TerminalStore>()((set, get) => ({
	openedSessionKeys: [],
	openSession: (sessionKey) => {
		const { openedSessionKeys } = get();
		if (openedSessionKeys.includes(sessionKey)) {
			return;
		}
		set({ openedSessionKeys: [...openedSessionKeys, sessionKey] });
	},
	sessions: {},
	registerSession: (sessionKey, handlers) => {
		set((state) => ({
			sessions: { ...state.sessions, [sessionKey]: handlers },
		}));
	},
	unregisterSession: (sessionKey) => {
		set((state) => {
			const { [sessionKey]: _removed, ...sessions } = state.sessions;
			return { sessions };
		});
	},
	appendOutput: (sessionKey, data) => {
		get().sessions[sessionKey]?.write(data);
	},
	notifyExit: (sessionKey, exitCode) => {
		get().sessions[sessionKey]?.onExit(exitCode);
	},
}));
