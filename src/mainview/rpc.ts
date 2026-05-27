import { useLogStore } from "@client/features/logs/store";
import { useTerminalStore } from "@client/features/terminal/store";
import { useAppStore } from "@client/store";
import { useConfigStore } from "@client/store/config-store";
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
			syncTerminalOutput: ({ sessionKey, data }) => {
				useTerminalStore.getState().appendOutput(sessionKey, data);
			},
			syncTerminalExit: ({ sessionKey, exitCode }) => {
				useTerminalStore.getState().notifyExit(sessionKey, exitCode);
			},
			syncAppConfig: ({ config }) => {
				useConfigStore.getState().syncConfig(config);
			},
		},
	},
});

const electroview = new Electroview({ rpc });

export const mainProcess = {
	onDoubleClickTitleBar: () => electroview.rpc?.send.onDoubleClickTitleBar({}),
	onSelectRepository: (repositoryPath?: string) =>
		electroview.rpc?.send.onSelectRepository({ repositoryPath }),
	onSelectWorktree: (worktreePath?: string) =>
		electroview.rpc?.send.onSelectWorktree({ worktreePath }),
	setLogPanelOpen: (open: boolean) =>
		electroview.rpc?.send.onSetLogPanelOpen({ open }),
	attachTerminal: (sessionKey: string, cols: number, rows: number) =>
		electroview.rpc?.send.onTerminalAttach({ sessionKey, cols, rows }),
	writeTerminalInput: (sessionKey: string, data: string) =>
		electroview.rpc?.send.onTerminalInput({ sessionKey, data }),
	resizeTerminal: (cols: number, rows: number) =>
		electroview.rpc?.send.onTerminalResize({ cols, rows }),
};
