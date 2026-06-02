import type { RPCSchema } from "electrobun";
import type { AppConfig } from "./config";
import type {
	CreateRepositoryParams,
	CreateRepositoryResult,
} from "./create-repository";
import type {
	CreateWorktreeParams,
	CreateWorktreeResult,
} from "./create-worktree";
import type { GitPullParams, GitPullResult } from "./git-pull";

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
			onTerminalAttach: {
				sessionId: string;
				cwd: string;
				cols: number;
				rows: number;
			};
			onTerminalClose: {
				sessionId: string;
			};
			onTerminalInput: {
				sessionId: string;
				data: string;
			};
			onTerminalResize: {
				cols: number;
				rows: number;
			};
			onCreateRepository: CreateRepositoryParams;
			onCreateWorktree: CreateWorktreeParams;
			onGitPull: GitPullParams;
			onWindowFocused: {
				focused: boolean;
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
				sessionId: string;
				data: string;
			};
			syncTerminalExit: {
				sessionId: string;
				exitCode: number;
			};
			syncAppConfig: {
				config: AppConfig;
			};
			syncCreateRepositoryResult: {
				result: CreateRepositoryResult;
			};
			syncCreateWorktreeResult: {
				result: CreateWorktreeResult;
			};
			syncGitPullResult: {
				loadingKey: string;
				result: GitPullResult;
			};
		};
	}>;
};
