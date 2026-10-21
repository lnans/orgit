import { join } from "node:path";
import { inspect } from "node:util";
import type { FsManager } from "./fsManager";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
	ts: string;
	level: LogLevel;
	message: string;
	details: string;
}

type Listener = (entry: LogEntry) => void;

export class Logger {
	private readonly _filePath: string;
	private readonly _listeners = new Set<Listener>();
	private readonly _history: LogEntry[] = [];
	private _ready = false;

	public constructor(
		logsFolderPath: string,
		private readonly _fs: FsManager,
		private readonly _maxHistory = 500,
	) {
		const fileName = `${new Date().toISOString().replace(/:/g, "-")}.log`;
		this._filePath = join(logsFolderPath, fileName);
	}

	public get filePath(): string {
		return this._filePath;
	}

	public async ensureReady(): Promise<this> {
		// openLog creates the folder and waits for the stream to really open
		const result = await this._fs.openLog(this._filePath);
		if (result.isError) throw result.error;

		this._ready = true;
		this.info(`[Logger] Ready in ${this._filePath}`);
		return this;
	}

	public async ensureStopped(): Promise<void> {
		if (!this._ready) return;
		this._ready = false;
		await this._fs.closeLog(this._filePath);
	}

	public subscribe(listener: Listener): () => void {
		this._listeners.add(listener);
		return () => this._listeners.delete(listener);
	}

	public getHistory(): LogEntry[] {
		return [...this._history];
	}

	public debug(message: string, ...args: unknown[]): void {
		this.write("debug", message, args);
	}

	public info(message: string, ...args: unknown[]): void {
		this.write("info", message, args);
	}

	public warn(message: string, ...args: unknown[]): void {
		this.write("warn", message, args);
	}

	public error(message: string, ...args: unknown[]): void {
		this.write("error", message, args);
	}

	private formatArgs(args: unknown[]): string {
		return args
			.map((arg) => {
				if (arg instanceof Error) return arg.stack ?? arg.message;
				if (typeof arg === "string") return arg;
				return inspect(arg, { colors: false, compact: true, depth: 4 });
			})
			.join(" ");
	}

	private write(level: LogLevel, message: string, args: unknown[]): void {
		const entry: LogEntry = {
			ts: new Date().toISOString(),
			level,
			message,
			details: this.formatArgs(args),
		};

		const prefix = `[${entry.ts}] ${level.toUpperCase()} ${message}`;

		// 1. console: keep raw args so they stay inspectable in the terminal
		console[level](prefix, ...args);

		// 2. file
		if (this._ready) {
			const line = entry.details ? `${prefix} ${entry.details}` : prefix;
			this._fs.log(this._filePath, line);
		}

		// 3. history + listeners (renderer forwarding lives here)
		this._history.push(entry);
		if (this._history.length > this._maxHistory) this._history.shift();

		for (const listener of this._listeners) {
			try {
				listener(entry);
			} catch {
				// a broken listener must never break logging
			}
		}
	}
}
