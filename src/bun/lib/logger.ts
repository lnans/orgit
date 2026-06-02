import { appendFileSync } from "node:fs";
import { inspect } from "node:util";
import {
	CONFIG_DIR,
	initLogSession,
	LOG_FILE,
} from "../features/app-state/paths";

type LogLevel = "debug" | "info" | "warn" | "error";

function pad2(value: number): string {
	return String(value).padStart(2, "0");
}

export function formatLocalDateTime(date = new Date()): string {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}.${String(date.getMilliseconds()).padStart(3, "0")}`;
}

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
	return `[${formatLocalDateTime()}] ${level.toUpperCase()} ${message}${formatArgs(args)}`;
}

function write(level: LogLevel, message: string, ...args: unknown[]) {
	const line = formatLine(level, message, args);

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
	const logFile = initLogSession();
	logger.info(
		`Orgit main process started (log: ${logFile}, dir: ${CONFIG_DIR})`,
	);
}
