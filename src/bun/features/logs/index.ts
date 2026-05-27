import { existsSync, type FSWatcher, readFileSync, watch } from "node:fs";
import path from "node:path";
import { CONFIG_DIR, LOG_FILE } from "../app-state/paths";

const LOG_BASENAME = path.basename(LOG_FILE);
const PUSH_DEBOUNCE_MS = 50;

export function readLogFile(): string {
	if (!existsSync(LOG_FILE)) {
		return "";
	}

	try {
		return readFileSync(LOG_FILE, "utf-8");
	} catch {
		return "";
	}
}

type LogSyncCallbacks = {
	onContent: (content: string) => void;
};

export function createLogSync(callbacks: LogSyncCallbacks) {
	let watcher: FSWatcher | undefined;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let active = false;

	function pushContent() {
		callbacks.onContent(readLogFile());
	}

	function schedulePush() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			if (active) {
				pushContent();
			}
		}, PUSH_DEBOUNCE_MS);
	}

	function startWatcher() {
		if (watcher) {
			return;
		}

		const watchPath = existsSync(LOG_FILE) ? LOG_FILE : CONFIG_DIR;
		watcher = watch(watchPath, (_event, filename) => {
			if (watchPath === LOG_FILE) {
				schedulePush();
				return;
			}

			if (filename !== null && filename !== LOG_BASENAME) {
				return;
			}

			if (existsSync(LOG_FILE)) {
				watcher?.close();
				watcher = watch(LOG_FILE, schedulePush);
				schedulePush();
			}
		});
	}

	function start() {
		if (active) {
			pushContent();
			return;
		}

		active = true;
		pushContent();
		startWatcher();
	}

	function stop() {
		active = false;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = undefined;
		}

		watcher?.close();
		watcher = undefined;
	}

	return { start, stop };
}
