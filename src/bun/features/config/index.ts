import {
	existsSync,
	type FSWatcher,
	readFileSync,
	watch,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import {
	type AppConfig,
	DEFAULT_APP_CONFIG,
	parseAppConfig,
} from "../../../shared/config";
import { logger } from "../../lib/logger";
import { CONFIG_DIR, CONFIG_FILE, ensureConfigDir } from "../app-state/paths";

const CONFIG_BASENAME = path.basename(CONFIG_FILE);
const RELOAD_DEBOUNCE_MS = 150;

export function loadAppConfig(): AppConfig {
	ensureConfigDir();

	if (!existsSync(CONFIG_FILE)) {
		const initial = structuredClone(DEFAULT_APP_CONFIG);
		saveAppConfig(initial);
		return initial;
	}

	try {
		const raw: unknown = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
		return parseAppConfig(raw);
	} catch (error) {
		logger.error("Failed to read config file. Using defaults.", error);
		return structuredClone(DEFAULT_APP_CONFIG);
	}
}

export function saveAppConfig(config: AppConfig) {
	ensureConfigDir();
	try {
		writeFileSync(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`);
	} catch (error) {
		logger.error("Failed to write config file.", error);
	}
}

type ConfigSyncCallbacks = {
	onConfig: (config: AppConfig) => void;
};

export function createConfigSync(callbacks: ConfigSyncCallbacks) {
	let watcher: FSWatcher | undefined;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function pushConfig() {
		callbacks.onConfig(loadAppConfig());
	}

	function scheduleReload() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			pushConfig();
		}, RELOAD_DEBOUNCE_MS);
	}

	function startWatcher() {
		if (watcher) {
			return;
		}

		const watchPath = existsSync(CONFIG_FILE) ? CONFIG_FILE : CONFIG_DIR;
		watcher = watch(watchPath, (_event, filename) => {
			if (watchPath === CONFIG_FILE) {
				scheduleReload();
				return;
			}

			if (filename !== null && filename !== CONFIG_BASENAME) {
				return;
			}

			if (existsSync(CONFIG_FILE)) {
				watcher?.close();
				watcher = watch(CONFIG_FILE, scheduleReload);
				scheduleReload();
			}
		});
	}

	function start() {
		pushConfig();
		startWatcher();
	}

	function stop() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = undefined;
		}

		watcher?.close();
		watcher = undefined;
	}

	return { start, stop };
}
