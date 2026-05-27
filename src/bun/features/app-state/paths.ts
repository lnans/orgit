import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { Utils } from "electrobun";

export const CONFIG_DIR = path.join(Utils.paths.home, ".config", "orgit");
export const STATE_FILE = path.join(CONFIG_DIR, "state.json");
export const LOG_FILE = path.join(CONFIG_DIR, "orgit.log");
export const DEFAULT_WORKSPACE = path.join(CONFIG_DIR, "workspace");

export function ensureConfigDir() {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}
}
