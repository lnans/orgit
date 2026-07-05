type ChangeStats = {
	filesModified: number;
	linesAdded: number;
	linesRemoved: number;
};

type ParsedWorktree = {
	path: string;
	head: string;
	branch: string | null;
};

const SHORTSTAT_FILE_RE = /(\d+) file/;
const SHORTSTAT_INSERTION_RE = /(\d+) insertion/;
const SHORTSTAT_DELETION_RE = /(\d+) deletion/;

const MISSING_HEAD_RE = /bad revision|unknown revision|ambiguous argument 'HEAD'|no commits yet/i;

export function isMissingHeadError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return MISSING_HEAD_RE.test(message);
}

export function parseShortstat(output: string): ChangeStats {
	return {
		filesModified: parseInt(output.match(SHORTSTAT_FILE_RE)?.[1] ?? "0", 10),
		linesAdded: parseInt(output.match(SHORTSTAT_INSERTION_RE)?.[1] ?? "0", 10),
		linesRemoved: parseInt(output.match(SHORTSTAT_DELETION_RE)?.[1] ?? "0", 10),
	};
}

export function countUntrackedFiles(output: string): number {
	return output.split(/\r?\n/).filter(Boolean).length;
}

export function parseWorktreeListPorcelain(output: string): ParsedWorktree[] {
	const worktrees: ParsedWorktree[] = [];
	let current: { path?: string; head?: string; branch: string | null } = { branch: null };

	const flush = () => {
		if (current.path !== undefined && current.head !== undefined) {
			worktrees.push({
				path: current.path,
				head: current.head,
				branch: current.branch,
			});
		}
		current = { branch: null };
	};

	for (const line of output.split(/\r?\n/)) {
		if (line.length === 0) {
			flush();
			continue;
		}

		if (line.startsWith("worktree ")) {
			flush();
			current.path = line.slice("worktree ".length);
		} else if (line.startsWith("HEAD ")) {
			current.head = line.slice("HEAD ".length);
		} else if (line.startsWith("branch refs/heads/")) {
			current.branch = line.slice("branch refs/heads/".length);
		} else if (line === "detached") {
			current.branch = null;
		}
	}

	flush();

	// Skip first result to exclude main branch
	return worktrees.slice(1);
}

export function worktreeDisplayName(parsed: ParsedWorktree): string {
	if (parsed.branch !== null) {
		return parsed.branch;
	}

	return `detached:${parsed.head.slice(0, 7)}`;
}
