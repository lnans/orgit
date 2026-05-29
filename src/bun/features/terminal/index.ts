import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { Repository } from "../../../shared/types";
import { createTerminalSession, type TerminalSession } from "./session";

export type TerminalManagerCallbacks = {
	onOutput: (sessionId: string, data: string) => void;
	onExit: (sessionId: string, exitCode: number) => void;
};

export type TerminalAttachOptions = {
	sessionId: string;
	cwd: string;
	cols: number;
	rows: number;
};

export type TerminalAttachCwdOptions = {
	workspacePath: string;
	tabCwd: string;
	selectedWorktreePath: string | undefined;
	repositoryPath: string | undefined;
	repositories: Repository[];
};

function pathsEqual(a: string, b: string): boolean {
	return path.resolve(a) === path.resolve(b);
}

function normalizeExistingDirectory(
	input: string | undefined,
): string | undefined {
	if (!input?.trim()) {
		return undefined;
	}
	const resolved = path.resolve(input.trim());
	return existsSync(resolved) ? resolved : undefined;
}

function repositoriesForLookup(
	repositories: Repository[],
	repositoryPath: string | undefined,
): Repository[] {
	if (!repositoryPath) {
		return repositories;
	}

	const scoped = repositories.filter((repository) =>
		pathsEqual(repository.path, repositoryPath),
	);
	return scoped.length > 0 ? scoped : repositories;
}

/**
 * Match tab/selection values against scanned worktrees by filesystem path or
 * branch name (e.g. "feature/my-branch" when state stored the name, not path).
 */
export function findScannedWorktreePath(
	repositories: Repository[],
	target: string | undefined,
	repositoryPath?: string,
): string | undefined {
	if (!target?.trim()) {
		return undefined;
	}

	const needle = target.trim();
	const needleBase = path.basename(needle);
	for (const repository of repositoriesForLookup(
		repositories,
		repositoryPath,
	)) {
		for (const worktree of repository.worktrees) {
			if (
				pathsEqual(worktree.path, needle) ||
				worktree.name === needle ||
				worktree.name === needleBase
			) {
				return path.resolve(worktree.path);
			}
		}
	}

	return undefined;
}

export function resolveTerminalCwd(
	workspacePath: string,
	worktreePath: string | undefined,
	repositoryPath?: string,
): string {
	const worktree = normalizeExistingDirectory(worktreePath);
	if (worktree) {
		return worktree;
	}
	const repository = normalizeExistingDirectory(repositoryPath);
	if (repository) {
		return repository;
	}
	const workspace = normalizeExistingDirectory(workspacePath);
	if (workspace) {
		return workspace;
	}
	return homedir();
}

function hasWorktreeAttachIntent(options: TerminalAttachCwdOptions): boolean {
	return Boolean(
		options.tabCwd?.trim() || options.selectedWorktreePath?.trim(),
	);
}

/**
 * Resolves PTY cwd for a tab attach. Uses git-scanned worktree paths when the
 * directory exists. Falls back to the repository root (not workspace) when a
 * worktree tab is open but its checkout directory is missing or stale.
 */
export function resolveTerminalAttachCwd(
	options: TerminalAttachCwdOptions,
): string {
	const worktreeSources = [options.tabCwd, options.selectedWorktreePath];
	const seen = new Set<string>();

	for (const raw of worktreeSources) {
		const fromScan = findScannedWorktreePath(
			options.repositories,
			raw,
			options.repositoryPath,
		);
		const existing = normalizeExistingDirectory(fromScan);
		if (existing && !seen.has(existing)) {
			seen.add(existing);
			return existing;
		}
	}

	for (const raw of worktreeSources) {
		if (!raw?.trim()) {
			continue;
		}
		const existing = normalizeExistingDirectory(raw);
		if (existing && !seen.has(existing)) {
			seen.add(existing);
			return existing;
		}
	}

	if (hasWorktreeAttachIntent(options)) {
		const repository = normalizeExistingDirectory(options.repositoryPath);
		if (repository && !seen.has(repository)) {
			return repository;
		}
		const workspace = normalizeExistingDirectory(options.workspacePath);
		if (workspace) {
			return workspace;
		}
		return homedir();
	}

	return resolveTerminalCwd(
		options.workspacePath,
		undefined,
		options.repositoryPath,
	);
}

export function createTerminalManager(callbacks: TerminalManagerCallbacks) {
	const sessions = new Map<string, TerminalSession>();
	let activeSessionId: string | undefined;
	let cols = 80;
	let rows = 24;

	function ensureSession(sessionId: string, cwd: string) {
		if (sessions.has(sessionId)) {
			sessions.get(sessionId)?.resize(cols, rows);
			return;
		}

		const session = createTerminalSession({
			cwd,
			cols,
			rows,
			onData: (data) => {
				callbacks.onOutput(sessionId, data);
			},
			onExit: (exitCode) => {
				sessions.delete(sessionId);
				if (activeSessionId === sessionId) {
					activeSessionId = undefined;
				}
				callbacks.onExit(sessionId, exitCode);
			},
		});

		sessions.set(sessionId, session);
	}

	return {
		attach(options: TerminalAttachOptions) {
			cols = options.cols;
			rows = options.rows;
			ensureSession(options.sessionId, options.cwd);
			activeSessionId = options.sessionId;
		},
		write(sessionId: string, data: string) {
			if (activeSessionId !== sessionId) {
				return;
			}
			sessions.get(sessionId)?.write(data);
		},
		close(sessionId: string) {
			sessions.get(sessionId)?.dispose();
			sessions.delete(sessionId);
			if (activeSessionId === sessionId) {
				activeSessionId = undefined;
			}
		},
		resize(nextCols: number, nextRows: number) {
			cols = nextCols;
			rows = nextRows;
			for (const session of sessions.values()) {
				session.resize(nextCols, nextRows);
			}
		},
		dispose() {
			for (const session of sessions.values()) {
				session.dispose();
			}
			sessions.clear();
			activeSessionId = undefined;
		},
	};
}
