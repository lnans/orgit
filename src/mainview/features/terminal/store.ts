import { resolveNextActiveTabId } from "@client/features/terminal/lib/tab-selection";
import { mainProcess } from "@client/rpc";
import type { TerminalTab } from "@shared/terminal-tab";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

const NO_WORKTREE_TABS: TerminalTab[] = [];

type SessionHandlers = {
	write: (data: string) => void;
	onExit: (exitCode: number) => void;
};

type TerminalStore = {
	tabs: TerminalTab[];
	activeTabIdByWorktree: Record<string, string>;
	sessions: Record<string, SessionHandlers>;
	createTab: (worktreePath: string) => string;
	closeTab: (tabId: string) => void;
	setActiveTab: (tabId: string) => void;
	registerSession: (sessionId: string, handlers: SessionHandlers) => void;
	unregisterSession: (sessionId: string) => void;
	appendOutput: (sessionId: string, data: string) => void;
	notifyExit: (sessionId: string, exitCode: number) => void;
};

function nextTabLabel(worktreePath: string, tabs: TerminalTab[]): string {
	const count = tabs.filter((tab) => tab.worktreePath === worktreePath).length;
	return `Terminal ${count + 1}`;
}

/** Webview-local terminal tab state. PTY sessions live in the main process. */
export const useTerminalStore = create<TerminalStore>()((set, get) => ({
	tabs: [],
	activeTabIdByWorktree: {},
	sessions: {},
	createTab: (worktreePath) => {
		const id = crypto.randomUUID();
		const tab: TerminalTab = {
			id,
			worktreePath,
			label: nextTabLabel(worktreePath, get().tabs),
		};
		set((state) => ({
			tabs: [...state.tabs, tab],
			activeTabIdByWorktree: {
				...state.activeTabIdByWorktree,
				[worktreePath]: id,
			},
		}));
		return id;
	},
	closeTab: (tabId) => {
		const { tabs, activeTabIdByWorktree } = get();
		const tab = tabs.find((entry) => entry.id === tabId);
		if (!tab) {
			return;
		}

		mainProcess.closeTerminal(tabId);

		const worktreeTabs = tabs.filter(
			(entry) => entry.worktreePath === tab.worktreePath,
		);
		const remaining = tabs.filter((entry) => entry.id !== tabId);
		const nextActiveByWorktree = { ...activeTabIdByWorktree };

		const nextActive = resolveNextActiveTabId(
			worktreeTabs,
			tabId,
			nextActiveByWorktree[tab.worktreePath],
		);
		if (nextActive) {
			nextActiveByWorktree[tab.worktreePath] = nextActive;
		} else {
			delete nextActiveByWorktree[tab.worktreePath];
		}

		set({
			tabs: remaining,
			activeTabIdByWorktree: nextActiveByWorktree,
		});
	},
	setActiveTab: (tabId) => {
		const tab = get().tabs.find((entry) => entry.id === tabId);
		if (!tab) {
			return;
		}
		set((state) => ({
			activeTabIdByWorktree: {
				...state.activeTabIdByWorktree,
				[tab.worktreePath]: tabId,
			},
		}));
	},
	registerSession: (sessionId, handlers) => {
		set((state) => ({
			sessions: { ...state.sessions, [sessionId]: handlers },
		}));
	},
	unregisterSession: (sessionId) => {
		set((state) => {
			const { [sessionId]: _removed, ...sessions } = state.sessions;
			return { sessions };
		});
	},
	appendOutput: (sessionId, data) => {
		get().sessions[sessionId]?.write(data);
	},
	notifyExit: (sessionId, exitCode) => {
		get().sessions[sessionId]?.onExit(exitCode);
	},
}));

export function useAllTerminalTabs() {
	return useTerminalStore(useShallow((state) => state.tabs));
}

export function useWorktreeTerminalTabs(worktreePath: string | undefined) {
	return useTerminalStore(
		useShallow((state) => {
			if (!worktreePath) {
				return NO_WORKTREE_TABS;
			}
			return state.tabs.filter((tab) => tab.worktreePath === worktreePath);
		}),
	);
}

export function useActiveTerminalTabId(worktreePath: string | undefined) {
	return useTerminalStore((state) =>
		worktreePath ? state.activeTabIdByWorktree[worktreePath] : undefined,
	);
}
