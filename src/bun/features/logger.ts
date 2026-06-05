import { dirname, join } from "node:path";
import { inspect } from "bun";
import type { IFsManager, ILogger } from "@/server/types/server.types";

export class Logger implements ILogger {
	private readonly _appLogFilePath: string;
	private readonly _fs: IFsManager;
	private _streamId: string | null = null;

	public constructor(appLogsFolderPath: string, fs: IFsManager) {
		const appLogFileName = `${new Date().toISOString().replace(/:/g, "-")}.log`;
		this._appLogFilePath = join(appLogsFolderPath, appLogFileName);
		this._fs = fs;
	}

	public ensureReady(): Logger {
		const appLogsFolderPath = dirname(this._appLogFilePath);

		const mkdirResult = this._fs.mkdirSync(appLogsFolderPath);
		if (mkdirResult.isError) throw mkdirResult.error;

		const appendResult = this._fs.appendFileSync(this._appLogFilePath, "");
		if (appendResult.isError) throw appendResult.error;

		const streamResult = this._fs.createWriteStream(this._appLogFilePath);
		if (streamResult.isError) throw streamResult.error;

		this._streamId = streamResult.data;

		this.info(`[Logger] Ready in ${this._appLogFilePath}`);
		return this;
	}

	public async ensureStopped(): Promise<void> {
		if (this._streamId !== null) {
			await this._fs.closeWriteStream(this._streamId);
			this._streamId = null;
		}
	}

	public debug(message: string, ...args: unknown[]): void {
		this.write("debug", console.debug, message, args);
	}

	public info(message: string, ...args: unknown[]): void {
		this.write("info", console.info, message, args);
	}

	public warn(message: string, ...args: unknown[]): void {
		this.write("warn", console.warn, message, args);
	}

	public error(message: string, ...args: unknown[]): void {
		this.write("error", console.error, message, args);
	}

	private formatArgs(args: unknown[]): string {
		if (args.length === 0) return "";

		return args
			.map((arg) => {
				if (arg instanceof Error) return arg.stack ?? arg.message;
				if (typeof arg === "string") return arg;
				return inspect(arg, { colors: false, compact: true, depth: 4 });
			})
			.join(" ");
	}

	private write(
		level: "debug" | "info" | "warn" | "error",
		consoleFn: (message: string, ...args: unknown[]) => void,
		message: string,
		args: unknown[],
	): void {
		const date = new Date().toISOString();
		const consoleMessage = `[${date}] ${level.toUpperCase()} ${message}`;
		const fileMessage = `${consoleMessage} ${this.formatArgs(args)}\n`;

		consoleFn.call(console, consoleMessage, ...args);

		if (this._streamId !== null) {
			void this._fs.writeStream(this._streamId, fileMessage);
		}
	}
}
