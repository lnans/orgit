import path from "node:path";
import type {
	ListRemoteBranchesResult,
	RemoteBranchOption,
} from "../../../shared/list-remote-branches";
import { DETACHED_HEAD, UNKNOWN_BRANCH } from "./git";
import { isRepositoryRoot } from "./git/repo";
import { runGitAsync } from "./git/run";
import { parseWorktreePorcelain } from "./worktrees/parse-porcelain";

const REMOTE_HEAD_SUFFIX = "/HEAD";

/**
 * Remote-tracking branches available for a new linked worktree (default remote,
 * excluding branches already checked out in another worktree for this repo).
 */
export async function listRemoteBranchesForWorktree(
	repositoryPath: string,
): Promise<ListRemoteBranchesResult> {
	const resolved = path.resolve(repositoryPath);
	if (!isRepositoryRoot(resolved)) {
		return { ok: false, error: "invalid_repository" };
	}

	const remote = await resolveDefaultRemote(resolved);
	if (!remote) {
		return { ok: false, error: "no_remote" };
	}

	const refsResult = await runGitAsync(resolved, [
		"for-each-ref",
		"--format=%(refname:short)",
		`refs/remotes/${remote}/`,
	]);
	if (!refsResult.ok) {
		return {
			ok: false,
			error: "list_failed",
			detail: refsResult.stdout || undefined,
		};
	}

	const checkedOutBranches = await listCheckedOutBranchNames(resolved);
	const branches: RemoteBranchOption[] = [];

	for (const line of refsResult.stdout.split("\n")) {
		const ref = line.trim();
		if (!ref || ref.endsWith(REMOTE_HEAD_SUFFIX)) {
			continue;
		}

		if (ref === remote) {
			continue;
		}

		const prefix = `${remote}/`;
		if (!ref.startsWith(prefix)) {
			continue;
		}

		const branchName = ref.slice(prefix.length);
		if (!branchName || checkedOutBranches.has(branchName)) {
			continue;
		}

		branches.push({ ref, branchName });
	}

	branches.sort((a, b) => a.branchName.localeCompare(b.branchName));
	return { ok: true, branches };
}

async function resolveDefaultRemote(
	repositoryPath: string,
): Promise<string | null> {
	const remotesResult = await runGitAsync(repositoryPath, ["remote"]);
	if (!remotesResult.ok) {
		return null;
	}

	const remotes = remotesResult.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	if (remotes.length === 0) {
		return null;
	}

	if (remotes.includes("origin")) {
		return "origin";
	}

	return remotes[0] ?? null;
}

async function listCheckedOutBranchNames(
	repositoryPath: string,
): Promise<Set<string>> {
	const result = await runGitAsync(repositoryPath, [
		"worktree",
		"list",
		"--porcelain",
	]);
	if (!result.ok) {
		return new Set();
	}

	const names = new Set<string>();
	for (const entry of parseWorktreePorcelain(result.stdout)) {
		if (
			entry.branchName === UNKNOWN_BRANCH ||
			entry.branchName === DETACHED_HEAD
		) {
			continue;
		}
		names.add(entry.branchName);
	}
	return names;
}
