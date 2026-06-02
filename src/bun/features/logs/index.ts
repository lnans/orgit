import { existsSync, type FSWatcher, readFileSync, watch } from "node:fs";
import { LOG_FILE } from "../app-state/paths";

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
		if (watcher || !LOG_FILE || !existsSync(LOG_FILE)) {
			return;
		}

		watcher = watch(LOG_FILE, schedulePush);
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
