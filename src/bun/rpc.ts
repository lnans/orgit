import { BrowserView } from "electrobun";
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
	};
}
