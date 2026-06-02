import { readdirSync } from "node:fs";
import path from "node:path";

const SOLUTION_EXTENSIONS = new Set([".sln", ".slnx"]);

/** Directory names skipped during recursive solution search. */
const SKIP_DIR_NAMES = new Set([
	".git",
	"node_modules",
	"bin",
	"obj",
	".vs",
	"dist",
	"build",
	"target",
	"packages",
	".nuget",
	".idea",
	".gradle",
]);

export type FindDotNetSolutionOptions = {
	maxDepth?: number;
};

/**
 * Returns the first `.sln` or `.slnx` found under `rootDir` (depth-first), or `null`.
 */
export function findDotNetSolutionFile(
	rootDir: string,
	options: FindDotNetSolutionOptions = {},
): string | null {
	const maxDepth = options.maxDepth ?? 20;
	const resolvedRoot = path.resolve(rootDir);

	function walk(dir: string, depth: number): string | null {
		if (depth > maxDepth) {
			return null;
		}

		let entries: ReturnType<typeof readdirSync>;
		try {
			entries = readdirSync(dir, { withFileTypes: true });
		} catch {
			return null;
		}

		const subdirs: string[] = [];

		for (const entry of entries) {
			const entryPath = path.join(dir, entry.name);
			if (entry.isFile()) {
				const ext = path.extname(entry.name).toLowerCase();
				if (SOLUTION_EXTENSIONS.has(ext)) {
					return entryPath;
				}
				continue;
			}

			if (entry.isDirectory() && !SKIP_DIR_NAMES.has(entry.name)) {
				subdirs.push(entryPath);
			}
		}

		for (const subdir of subdirs) {
			const found = walk(subdir, depth + 1);
			if (found) {
				return found;
			}
		}

		return null;
	}

	return walk(resolvedRoot, 0);
}

export function worktreeHasDotNetSolution(worktreePath: string): boolean {
	return findDotNetSolutionFile(worktreePath) !== null;
}
