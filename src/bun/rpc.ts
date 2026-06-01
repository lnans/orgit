import { BrowserView } from "electrobun";
import type { AppConfig } from "../shared/config";
import type {
	CreateRepositoryParams,
	CreateRepositoryResult,
} from "../shared/create-repository";
import type {
	CreateWorktreeParams,
	CreateWorktreeResult,
} from "../shared/create-worktree";
import type { AppState, MainRPC } from "../shared/types";

type WindowControls = {
	isMaximized(): boolean;
	unmaximize(): void;
	maximize(): void;
};

type RpcHandlers = {
	onDoubleClickTitleBar: (params: { mainWindow: WindowControls }) => void;
	onSelectRepository: (params: {
		repositoryPath: string | null | undefined;
	}) => AppState;
	onSelectWorktree: (params: {
		worktreePath: string | null | undefined;
	}) => AppState;
	onSetLogPanelOpen: (params: { open: boolean }) => void;
	onTerminalAttach: (params: {
		sessionId: string;
		cwd: string;
		cols: number;
		rows: number;
	}) => void;
	onTerminalClose: (params: { sessionId: string }) => void;
	onTerminalInput: (params: { sessionId: string; data: string }) => void;
	onTerminalResize: (params: { cols: number; rows: number }) => void;
	onCreateRepository: (params: CreateRepositoryParams) => Promise<void>;
	onCreateWorktree: (params: CreateWorktreeParams) => Promise<void>;
};

export type WebviewRPC = ReturnType<typeof createRpc>;

export function createRpc(handlers: RpcHandlers) {
	let mainWindow: WindowControls | undefined;

	const rpc = BrowserView.defineRPC<MainRPC>({
		maxRequestTime: 5000,
		handlers: {
			messages: {
				onDoubleClickTitleBar: () => {
					if (mainWindow) {
						handlers.onDoubleClickTitleBar({ mainWindow });
					}
				},
				onSelectRepository: ({ repositoryPath }) => {
					const appState = handlers.onSelectRepository({ repositoryPath });
					rpc.send.syncAppState({ appState });
				},
				onSelectWorktree: ({ worktreePath }) => {
					const appState = handlers.onSelectWorktree({ worktreePath });
					rpc.send.syncAppState({ appState });
				},
				onSetLogPanelOpen: ({ open }) => {
					handlers.onSetLogPanelOpen({ open });
				},
				onTerminalAttach: ({ sessionId, cwd, cols, rows }) => {
					handlers.onTerminalAttach({ sessionId, cwd, cols, rows });
				},
				onTerminalClose: ({ sessionId }) => {
					handlers.onTerminalClose({ sessionId });
				},
				onTerminalInput: ({ sessionId, data }) => {
					handlers.onTerminalInput({ sessionId, data });
				},
				onTerminalResize: ({ cols, rows }) => {
					handlers.onTerminalResize({ cols, rows });
				},
				onCreateRepository: (params) => {
					void handlers.onCreateRepository(params);
				},
				onCreateWorktree: (params) => {
					void handlers.onCreateWorktree(params);
				},
			},
			requests: {},
		},
	});

	return {
		...rpc,
		setMainWindow: (window: WindowControls) => {
			mainWindow = window;
		},
		syncAppState: (appState: AppState) => {
			rpc.send.syncAppState({ appState });
		},
		syncLogContent: (content: string) => {
			rpc.send.syncLogContent({ content });
		},
		syncTerminalOutput: (sessionId: string, data: string) => {
			rpc.send.syncTerminalOutput({ sessionId, data });
		},
		syncTerminalExit: (sessionId: string, exitCode: number) => {
			rpc.send.syncTerminalExit({ sessionId, exitCode });
		},
		syncAppConfig: (config: AppConfig) => {
			rpc.send.syncAppConfig({ config });
		},
		syncCreateRepositoryResult: (result: CreateRepositoryResult) => {
			rpc.send.syncCreateRepositoryResult({ result });
		},
		syncCreateWorktreeResult: (result: CreateWorktreeResult) => {
			rpc.send.syncCreateWorktreeResult({ result });
		},
	};
}
