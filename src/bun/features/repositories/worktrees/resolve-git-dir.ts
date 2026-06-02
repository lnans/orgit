import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Resolves the real `.git` directory for a checkout (main repo dir or linked worktree).
 * Returns `null` when `.git` is missing or unreadable.
 */
export function resolveGitDir(checkoutPath: string): string | null {
	const dotGit = path.join(checkoutPath, ".git");
	if (!existsSync(dotGit)) {
		return null;
	}

	try {
		const stat = statSync(dotGit);
		if (stat.isDirectory()) {
			return dotGit;
		}

		if (!stat.isFile()) {
			return null;
		}

		const content = readFileSync(dotGit, "utf-8").trim();
		const match = /^gitdir:\s*(.+)$/m.exec(content);
		if (!match) {
			return null;
		}

		const gitdir = match[1].trim();
		return path.isAbsolute(gitdir)
			? gitdir
			: path.resolve(checkoutPath, gitdir);
	} catch {
		return null;
	}
}

const GIT_METADATA_FILES = ["index", "HEAD", "logs/HEAD", "ORIG_HEAD"] as const;

/** Paths to watch for index/HEAD/ref updates (staging, commits, checkouts). */
export function listGitMetadataWatchTargets(gitDir: string): string[] {
	return GIT_METADATA_FILES.map((file) => path.join(gitDir, file)).filter((p) =>
		existsSync(p),
	);
}

/**
 * Checkout root plus git metadata files. Metadata lives outside the tree for linked worktrees.
 */
export function listWorktreeWatchTargets(worktreePath: string): string[] {
	const resolvedCheckout = path.resolve(worktreePath);
	const targets = [resolvedCheckout];

	const gitDir = resolveGitDir(resolvedCheckout);
	if (gitDir) {
		targets.push(...listGitMetadataWatchTargets(gitDir));
	}

	return targets;
}
