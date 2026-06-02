import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { Subprocess } from "bun";
import { createTerminalStreamDecoder } from "./decode";
import { getShellArgs, resolveShellCandidates } from "./shell";

export type TerminalSessionOptions = {
	cwd: string;
	cols: number;
	rows: number;
	onData: (data: string) => void;
	onExit: (exitCode: number) => void;
};

function terminalEnv(): Record<string, string> {
	const lang = process.env.LC_ALL ?? process.env.LANG ?? "en_US.UTF-8";
	return {
		...process.env,
		TERM: "xterm-256color",
		COLORTERM: "truecolor",
		LANG: lang,
		LC_ALL: lang,
	};
}

function resolveSpawnCwd(cwd: string): string {
	const resolved = path.resolve(cwd.trim() || homedir());
	if (!existsSync(resolved)) {
		throw new Error(`Working directory does not exist: ${resolved}`);
	}
	return resolved;
}

type SpawnTerminalOptions = {
	cwd: string;
	cols: number;
	rows: number;
	onData: (data: string | Uint8Array) => void;
};

function formatSpawnError(error: unknown, cwd: string): string {
	const message =
		error instanceof Error ? error.message : "Failed to start shell";
	const resolved = path.resolve(cwd);
	const cwdHint = existsSync(resolved)
		? `cwd=${resolved}`
		: `cwd does not exist: ${cwd}`;
	return `Failed to start shell (${cwdHint}): ${message}`;
}

function spawnTerminal(options: SpawnTerminalOptions): Subprocess {
	const cwd = resolveSpawnCwd(options.cwd);
	const spawnOptions = {
		cwd,
		env: terminalEnv(),
		terminal: {
			name: "xterm-256color",
			cols: options.cols,
			rows: options.rows,
			data(_terminal: unknown, data: string | Uint8Array) {
				options.onData(data);
			},
		},
	} as const;

	// Bare names first — same pattern as git spawn in packaged macOS builds.
	const shells = ["zsh", "bash", "sh", ...resolveShellCandidates()];
	const tried = new Set<string>();
	let lastError: unknown;

	for (const shell of shells) {
		if (tried.has(shell)) {
			continue;
		}
		tried.add(shell);
		try {
			return Bun.spawn([shell, ...getShellArgs(shell)], spawnOptions);
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error("Failed to spawn a shell for the terminal session");
}

function createFailedSession(
	options: TerminalSessionOptions,
	message: string,
): {
	write: (data: string) => void;
	resize: (cols: number, rows: number) => void;
	dispose: () => void;
} {
	let closed = false;

	const writeError = () => {
		options.onData(`\r\n\x1b[31m${message}\x1b[0m\r\n`);
		queueMicrotask(() => {
			if (!closed) {
				options.onExit(1);
			}
		});
	};

	queueMicrotask(writeError);

	return {
		write() {},
		resize() {},
		dispose() {
			closed = true;
		},
	};
}

export function createTerminalSession(options: TerminalSessionOptions) {
	let proc: Subprocess | undefined;
	let closed = false;
	const streamDecoder = createTerminalStreamDecoder();

	function dispose() {
		closed = true;
		streamDecoder.flush();
		proc?.terminal?.close();
		proc?.kill();
		proc = undefined;
	}

	try {
		proc = spawnTerminal({
			cwd: options.cwd,
			cols: options.cols,
			rows: options.rows,
			onData: (data) => {
				if (!closed) {
					options.onData(streamDecoder.decode(data));
				}
			},
		});
	} catch (error) {
		return createFailedSession(options, formatSpawnError(error, options.cwd));
	}

	const terminal = proc.terminal;
	if (!terminal) {
		return createFailedSession(options, "Failed to create terminal PTY");
	}

	void proc.exited.then((exitCode) => {
		if (!closed) {
			options.onExit(exitCode);
		}
	});

	return {
		write(data: string) {
			if (closed || !proc?.terminal) {
				return;
			}

			if (data.includes("\u0003") && proc) {
				proc.kill("SIGINT");
			}

			proc.terminal.write(data);
		},
		resize(cols: number, rows: number) {
			if (!closed) {
				proc?.terminal?.resize(cols, rows);
			}
		},
		dispose,
	};
}

export type TerminalSession = ReturnType<typeof createTerminalSession>;
