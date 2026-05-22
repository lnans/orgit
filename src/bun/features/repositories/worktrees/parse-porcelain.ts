import { DETACHED_HEAD, UNKNOWN_BRANCH } from "../git";

export type ParsedWorktreeEntry = {
	path: string;
	branchName: string;
};

export function parseWorktreePorcelain(output: string): ParsedWorktreeEntry[] {
	const entries: ParsedWorktreeEntry[] = [];
	let currentPath: string | undefined;
	let currentBranch: string | undefined;

	const flush = () => {
		if (!currentPath) {
			return;
		}

		entries.push({
			path: currentPath,
			branchName: currentBranch ?? UNKNOWN_BRANCH,
		});
		currentPath = undefined;
		currentBranch = undefined;
	};

	for (const line of output.split("\n")) {
		if (line.startsWith("worktree ")) {
			flush();
			currentPath = line.slice("worktree ".length);
			continue;
		}

		if (line.startsWith("branch refs/heads/")) {
			currentBranch = line.slice("branch refs/heads/".length);
			continue;
		}

		if (line === "detached") {
			currentBranch = DETACHED_HEAD;
		}
	}

	flush();
	return entries;
}
