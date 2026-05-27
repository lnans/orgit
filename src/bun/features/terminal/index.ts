import { homedir } from "node:os";
import { createTerminalSession, type TerminalSession } from "./session";

export type TerminalManagerCallbacks = {
	onOutput: (data: string) => void;
	onExit: (exitCode: number) => void;
};

export type TerminalSpawnOptions = {
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
	let session: TerminalSession | undefined;
	let cols = 80;
	let rows = 24;
	let cwd = homedir();

	function spawn() {
		session?.dispose();
		session = createTerminalSession({
			cwd,
			cols,
			rows,
			onData: callbacks.onOutput,
			onExit: (exitCode) => {
				session = undefined;
				callbacks.onExit(exitCode);
			},
		});
	}

	return {
		open(options: TerminalSpawnOptions) {
			cwd = options.cwd;
			cols = options.cols;
			rows = options.rows;
			spawn();
		},
		restart(options: TerminalSpawnOptions) {
			cwd = options.cwd;
			cols = options.cols;
			rows = options.rows;
			spawn();
		},
		write(data: string) {
			session?.write(data);
		},
		resize(nextCols: number, nextRows: number) {
			cols = nextCols;
			rows = nextRows;
			session?.resize(nextCols, nextRows);
		},
		dispose() {
			session?.dispose();
			session = undefined;
		},
	};
}
