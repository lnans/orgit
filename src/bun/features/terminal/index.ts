import { homedir } from "node:os";
import { createTerminalSession, type TerminalSession } from "./session";

export type TerminalManagerCallbacks = {
	onOutput: (sessionKey: string, data: string) => void;
	onExit: (sessionKey: string, exitCode: number) => void;
};

export type TerminalAttachOptions = {
	sessionKey: string;
	cwd: string;
	cols: number;
	rows: number;
};

export function resolveTerminalCwd(
	workspacePath: string,
	worktreePath: string | undefined,
): string {
	if (worktreePath) {
		return worktreePath;
	}
	if (workspacePath) {
		return workspacePath;
	}
	return homedir();
}

export function createTerminalManager(callbacks: TerminalManagerCallbacks) {
	const sessions = new Map<string, TerminalSession>();
	let activeSessionKey: string | undefined;
	let cols = 80;
	let rows = 24;

	function ensureSession(sessionKey: string, cwd: string) {
		if (sessions.has(sessionKey)) {
			sessions.get(sessionKey)?.resize(cols, rows);
			return;
		}

		const session = createTerminalSession({
			cwd,
			cols,
			rows,
			onData: (data) => {
				callbacks.onOutput(sessionKey, data);
			},
			onExit: (exitCode) => {
				sessions.delete(sessionKey);
				if (activeSessionKey === sessionKey) {
					activeSessionKey = undefined;
				}
				callbacks.onExit(sessionKey, exitCode);
			},
		});

		sessions.set(sessionKey, session);
	}

	return {
		attach(options: TerminalAttachOptions) {
			cols = options.cols;
			rows = options.rows;
			ensureSession(options.sessionKey, options.cwd);
			activeSessionKey = options.sessionKey;
		},
		write(sessionKey: string, data: string) {
			if (activeSessionKey !== sessionKey) {
				return;
			}
			sessions.get(sessionKey)?.write(data);
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
			activeSessionKey = undefined;
		},
	};
}
