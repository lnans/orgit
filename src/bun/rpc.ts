import { BrowserView } from "electrobun";
import type { AppConfig } from "../shared/config";
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
		sessionKey: string;
		cols: number;
		rows: number;
	}) => void;
	onTerminalInput: (params: { sessionKey: string; data: string }) => void;
	onTerminalResize: (params: { cols: number; rows: number }) => void;
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
				onTerminalAttach: ({ sessionKey, cols, rows }) => {
					handlers.onTerminalAttach({ sessionKey, cols, rows });
				},
				onTerminalInput: ({ sessionKey, data }) => {
					handlers.onTerminalInput({ sessionKey, data });
				},
				onTerminalResize: ({ cols, rows }) => {
					handlers.onTerminalResize({ cols, rows });
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
		syncTerminalOutput: (sessionKey: string, data: string) => {
			rpc.send.syncTerminalOutput({ sessionKey, data });
		},
		syncTerminalExit: (sessionKey: string, exitCode: number) => {
			rpc.send.syncTerminalExit({ sessionKey, exitCode });
		},
		syncAppConfig: (config: AppConfig) => {
			rpc.send.syncAppConfig({ config });
		},
	};
}
