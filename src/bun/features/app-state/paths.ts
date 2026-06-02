import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Utils } from "electrobun";

/** Dev builds use a separate config folder so state does not mix with production. */
export function resolveConfigDirName(channel: string | null): string {
	return channel === "dev" ? "orgit-dev" : "orgit";
}

function readElectrobunChannel(): string | null {
	try {
		const raw = readFileSync(
			path.join("..", "Resources", "version.json"),
			"utf-8",
		);
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"channel" in parsed &&
			typeof parsed.channel === "string"
		) {
			return parsed.channel;
		}
	} catch {
		// Not running inside an Electrobun bundle (e.g. unit tests).
	}
	return null;
}

export const CONFIG_DIR = path.join(
	Utils.paths.home,
	".config",
	resolveConfigDirName(readElectrobunChannel()),
);
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export const STATE_FILE = path.join(CONFIG_DIR, "state.json");
export const LOGS_DIR = path.join(CONFIG_DIR, "logs");
/** Per-run log file; set once at startup via {@link initLogSession}. */
export let LOG_FILE = "";
export const DEFAULT_WORKSPACE = path.join(CONFIG_DIR, "workspace");

function pad2(value: number): string {
	return String(value).padStart(2, "0");
}

/** Filesystem-safe local timestamp for a session log filename. */
export function formatLogSessionFileName(date = new Date()): string {
	const stamp = [
		date.getFullYear(),
		pad2(date.getMonth() + 1),
		pad2(date.getDate()),
	].join("-");
	const time = [
		pad2(date.getHours()),
		pad2(date.getMinutes()),
		pad2(date.getSeconds()),
		String(date.getMilliseconds()).padStart(3, "0"),
	].join("-");
	return `orgit-${stamp}_${time}.log`;
}

export function ensureConfigDir() {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}
}

/** Creates `logs/` and an empty session log file for this app run. */
export function initLogSession(startedAt = new Date()): string {
	ensureConfigDir();
	if (!existsSync(LOGS_DIR)) {
		mkdirSync(LOGS_DIR, { recursive: true });
	}

	LOG_FILE = path.join(LOGS_DIR, formatLogSessionFileName(startedAt));
	writeFileSync(LOG_FILE, "", "utf-8");
	return LOG_FILE;
}
