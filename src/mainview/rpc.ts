import { useLogStore } from "@client/features/logs/store";
import { useTerminalStore } from "@client/features/terminal/store";
import { useAppStore } from "@client/store";
import { useConfigStore } from "@client/store/config-store";
import type {
	CreateRepositoryParams,
	CreateRepositoryResult,
} from "@shared/create-repository";
import type {
	CreateWorktreeParams,
	CreateWorktreeResult,
} from "@shared/create-worktree";
import type { MainRPC } from "@shared/types";
import { Electroview } from "electrobun/view";

const rpc = Electroview.defineRPC<MainRPC>({
	maxRequestTime: 5000,
	handlers: {
		requests: {},
		messages: {
			syncAppState: ({ appState }) => {
				useAppStore.getState().syncAppState(appState);
			},
			syncLogContent: ({ content }) => {
				useLogStore.getState().setContent(content);
			},
			syncTerminalOutput: ({ sessionId, data }) => {
				useTerminalStore.getState().appendOutput(sessionId, data);
			},
			syncTerminalExit: ({ sessionId, exitCode }) => {
				useTerminalStore.getState().notifyExit(sessionId, exitCode);
			},
			syncAppConfig: ({ config }) => {
				useConfigStore.getState().syncConfig(config);
			},
			syncCreateRepositoryResult: ({ result }) => {
				for (const listener of createRepositoryResultListeners) {
					listener(result);
				}
			},
			syncCreateWorktreeResult: ({ result }) => {
				for (const listener of createWorktreeResultListeners) {
					listener(result);
				}
			},
		},
	},
});

const createRepositoryResultListeners = new Set<
	(result: CreateRepositoryResult) => void
>();
const createWorktreeResultListeners = new Set<
	(result: CreateWorktreeResult) => void
>();

const electroview = new Electroview({ rpc });

export const mainProcess = {
	onDoubleClickTitleBar: () => electroview.rpc?.send.onDoubleClickTitleBar({}),
	onSelectRepository: (repositoryPath?: string) =>
		electroview.rpc?.send.onSelectRepository({ repositoryPath }),
	onSelectWorktree: (worktreePath?: string) =>
		electroview.rpc?.send.onSelectWorktree({ worktreePath }),
	setLogPanelOpen: (open: boolean) =>
		electroview.rpc?.send.onSetLogPanelOpen({ open }),
	attachTerminal: (
		sessionId: string,
		cwd: string,
		cols: number,
		rows: number,
	) => electroview.rpc?.send.onTerminalAttach({ sessionId, cwd, cols, rows }),
	closeTerminal: (sessionId: string) =>
		electroview.rpc?.send.onTerminalClose({ sessionId }),
	writeTerminalInput: (sessionId: string, data: string) =>
		electroview.rpc?.send.onTerminalInput({ sessionId, data }),
	resizeTerminal: (cols: number, rows: number) =>
		electroview.rpc?.send.onTerminalResize({ cols, rows }),
	createRepository: (params: CreateRepositoryParams) =>
		electroview.rpc?.send.onCreateRepository(params),
	onCreateRepositoryResult: (
		listener: (result: CreateRepositoryResult) => void,
	) => {
		createRepositoryResultListeners.add(listener);
		return () => {
			createRepositoryResultListeners.delete(listener);
		};
	},
	createWorktree: (params: CreateWorktreeParams) =>
		electroview.rpc?.send.onCreateWorktree(params),
	onCreateWorktreeResult: (
		listener: (result: CreateWorktreeResult) => void,
	) => {
		createWorktreeResultListeners.add(listener);
		return () => {
			createWorktreeResultListeners.delete(listener);
		};
	},
};
