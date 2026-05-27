import { appendFileSync } from "node:fs";
import { inspect } from "node:util";
import {
	CONFIG_DIR,
	ensureConfigDir,
	LOG_FILE,
} from "../features/app-state/paths";

type LogLevel = "debug" | "info" | "warn" | "error";

function formatArgs(args: unknown[]): string {
	if (args.length === 0) {
		return "";
	}

	return ` ${args.map(formatArg).join(" ")}`;
}

function formatArg(value: unknown): string {
	if (value instanceof Error) {
		return value.stack ?? value.message;
	}

	if (typeof value === "string") {
		return value;
	}

	return inspect(value, { depth: 4, breakLength: Number.POSITIVE_INFINITY });
}

function formatLine(level: LogLevel, message: string, args: unknown[]): string {
	return `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${formatArgs(args)}`;
}

function write(level: LogLevel, message: string, ...args: unknown[]) {
	const line = formatLine(level, message, args);

	ensureConfigDir();
	appendFileSync(LOG_FILE, `${line}\n`, "utf-8");

	const log =
		level === "error"
			? console.error
			: level === "warn"
				? console.warn
				: console.log;
	log(line);
}

export const logger = {
	debug(message: string, ...args: unknown[]) {
		write("debug", message, ...args);
	},
	info(message: string, ...args: unknown[]) {
		write("info", message, ...args);
	},
	warn(message: string, ...args: unknown[]) {
		write("warn", message, ...args);
	},
	error(message: string, ...args: unknown[]) {
		write("error", message, ...args);
	},
};

export function initLogger() {
	ensureConfigDir();
	logger.info(
		`Orgit main process started (log: ${LOG_FILE}, config: ${CONFIG_DIR})`,
	);
}
