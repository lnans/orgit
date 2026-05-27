import type { RPCSchema } from "electrobun";
import type { AppConfig } from "./config";

export type WorktreeDiffStats = {
	filesModified: number;
	linesAdded: number;
	linesRemoved: number;
};

export const EMPTY_WORKTREE_DIFF_STATS: WorktreeDiffStats = {
	filesModified: 0,
	linesAdded: 0,
	linesRemoved: 0,
};

export type Worktree = {
	name: string;
	path: string;
} & WorktreeDiffStats;

export type Repository = {
	name: string;
	path: string;
	branch: string;
	worktrees: Worktree[];
};

export type SelectedWorktreePaths = Record<string, string>;

export const PERSISTED_STATE_VERSION = 1;

export type PersistedState = {
	version: number;
	workspacePath: string;
	selectedRepositoryPath?: string;
	selectedWorktreePaths: SelectedWorktreePaths;
};

export type AppState = PersistedState & {
	repositories: Repository[];
};

export type MainRPC = {
	bun: RPCSchema<{
		requests: Record<string, never>;
		messages: {
			onDoubleClickTitleBar: object;
			onSelectRepository: {
				repositoryPath: string | null | undefined;
			};
			onSelectWorktree: {
				worktreePath: string | null | undefined;
			};
			onSetLogPanelOpen: {
				open: boolean;
			};
			onTerminalOpen: {
				cols: number;
				rows: number;
			};
			onTerminalInput: {
				data: string;
			};
			onTerminalResize: {
				cols: number;
				rows: number;
			};
			onTerminalRestart: {
				cols: number;
				rows: number;
			};
		};
	}>;
	webview: RPCSchema<{
		requests: Record<string, never>;
		messages: {
			syncAppState: {
				appState: AppState;
			};
			syncLogContent: {
				content: string;
			};
			syncTerminalOutput: {
				data: string;
			};
			syncTerminalExit: {
				exitCode: number;
			};
			syncAppConfig: {
				config: AppConfig;
			};
		};
	}>;
};
