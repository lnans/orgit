import { existsSync, type FSWatcher, watch } from "node:fs";
import path from "node:path";
import type { Repository } from "../../../../shared/types";
import { logger } from "../../../lib/logger";
import { listWorktreeWatchTargets } from "./resolve-git-dir";
import { shouldIgnoreWatchEvent } from "./watch-ignore";

const DEBOUNCE_MS = 300;
/** Fallback when recursive checkout watch is unavailable (Linux). */
const POLL_INTERVAL_MS = 3_000;

const PLATFORM_SUPPORTS_RECURSIVE_CHECKOUT_WATCH =
	process.platform === "darwin" || process.platform === "win32";

type WorktreeStatusSyncCallbacks = {
	onChange: (worktreePaths: ReadonlySet<string>) => void;
};

type ActiveWatch = {
	worktreePath: string;
	watcher: FSWatcher;
};

/**
 * Watches worktree checkouts and git metadata when {@link setActive} is true, then
 * debounces diff-stat refreshes. On Linux, polls checkouts periodically because
 * `fs.watch` is not recursive there.
 */
export function createWorktreeStatusSync(
	callbacks: WorktreeStatusSyncCallbacks,
) {
	const watches = new Map<string, ActiveWatch>();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	const dirtyWorktrees = new Set<string>();
	let pollTimer: ReturnType<typeof setInterval> | undefined;
	let repositories: Repository[] = [];
	let watchingActive = false;

	function markDirty(worktreePath: string) {
		dirtyWorktrees.add(worktreePath);
		scheduleFlush();
	}

	function scheduleFlush() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			if (dirtyWorktrees.size === 0) {
				return;
			}

			const paths = new Set(dirtyWorktrees);
			dirtyWorktrees.clear();
			callbacks.onChange(paths);
		}, DEBOUNCE_MS);
	}

	function addWatch(
		watchPath: string,
		worktreePath: string,
		recursive: boolean,
	) {
		if (watches.has(watchPath) || !existsSync(watchPath)) {
			return;
		}

		try {
			const watcher = watch(
				watchPath,
				recursive ? { recursive: true } : undefined,
				(_event, filename) => {
					if (shouldIgnoreWatchEvent(filename)) {
						return;
					}
					markDirty(worktreePath);
				},
			);

			watcher.on("error", (error) => {
				logger.warn(`Worktree watch error on ${watchPath}:`, error);
			});

			watches.set(watchPath, { worktreePath, watcher });
		} catch (error) {
			logger.warn(`Failed to watch ${watchPath}:`, error);
		}
	}

	function clearWatches() {
		for (const { watcher } of watches.values()) {
			watcher.close();
		}
		watches.clear();
	}

	function startLinuxPoll(worktreePaths: string[]) {
		stopLinuxPoll();

		if (
			PLATFORM_SUPPORTS_RECURSIVE_CHECKOUT_WATCH ||
			worktreePaths.length === 0
		) {
			return;
		}

		pollTimer = setInterval(() => {
			for (const worktreePath of worktreePaths) {
				markDirty(worktreePath);
			}
		}, POLL_INTERVAL_MS);
	}

	function stopLinuxPoll() {
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = undefined;
		}
	}

	function pauseWatching() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = undefined;
		}

		dirtyWorktrees.clear();
		clearWatches();
		stopLinuxPoll();
	}

	function startWatching() {
		pauseWatching();

		const worktreePaths: string[] = [];

		for (const repository of repositories) {
			for (const worktree of repository.worktrees) {
				worktreePaths.push(worktree.path);

				for (const target of listWorktreeWatchTargets(worktree.path)) {
					const isCheckoutRoot = target === path.resolve(worktree.path);
					addWatch(
						target,
						worktree.path,
						isCheckoutRoot && PLATFORM_SUPPORTS_RECURSIVE_CHECKOUT_WATCH,
					);
				}
			}
		}

		startLinuxPoll(worktreePaths);
	}

	/** Remember worktrees; start filesystem watches only when {@link setActive} is true. */
	function sync(nextRepositories: Repository[]) {
		repositories = nextRepositories;
		if (watchingActive) {
			startWatching();
		}
	}

	/** Start or stop filesystem watches (e.g. when the app window gains or loses focus). */
	function setActive(active: boolean) {
		if (watchingActive === active) {
			return;
		}

		watchingActive = active;
		if (active) {
			startWatching();
		} else {
			pauseWatching();
		}
	}

	function stop() {
		watchingActive = false;
		repositories = [];
		pauseWatching();
	}

	return { sync, setActive, stop };
}
