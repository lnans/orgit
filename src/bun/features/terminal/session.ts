import type { Subprocess } from "bun";
import { getDefaultShell, getShellArgs } from "./shell";

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

export function createTerminalSession(options: TerminalSessionOptions) {
	const shell = getDefaultShell();
	let proc: Subprocess | undefined;
	let closed = false;
	/** Per-session decoder so partial UTF-8 bytes are not mixed across tabs. */
	const textDecoder = new TextDecoder("utf-8");

	function decodeTerminalData(data: string | Uint8Array): string {
		return typeof data === "string"
			? data
			: textDecoder.decode(data, { stream: true });
	}

	function dispose() {
		closed = true;
		textDecoder.decode();
		proc?.terminal?.close();
		proc?.kill();
		proc = undefined;
	}

	proc = Bun.spawn([shell, ...getShellArgs(shell)], {
		cwd: options.cwd,
		env: terminalEnv(),
		terminal: {
			name: "xterm-256color",
			cols: options.cols,
			rows: options.rows,
			data(_terminal, data) {
				if (!closed) {
					options.onData(decodeTerminalData(data));
				}
			},
		},
	});

	const terminal = proc.terminal;
	if (!terminal) {
		throw new Error("Failed to create terminal PTY");
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
