import { existsSync } from "node:fs";
import { homedir } from "node:os";
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

function isExistingDirectory(path: string | undefined): path is string {
	return typeof path === "string" && path.length > 0 && existsSync(path);
}

export function resolveTerminalCwd(
	workspacePath: string,
	worktreePath: string | undefined,
	repositoryPath?: string,
): string {
	if (isExistingDirectory(worktreePath)) {
		return worktreePath;
	}
	if (isExistingDirectory(repositoryPath)) {
		return repositoryPath;
	}
	if (isExistingDirectory(workspacePath)) {
		return workspacePath;
	}
	return homedir();
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
