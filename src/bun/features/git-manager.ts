import { basename, dirname } from "node:path";
import type { IFsManager, ILogger, Result } from "@/server/types/server.types";
import type { RepositoryDto } from "@/shared/types/RepositoryDto";
import type { WorktreeDto } from "@/shared/types/WorktreeDto";
import {
	countUntrackedFiles,
	isMissingHeadError,
	parseShortstat,
	parseWorktreeListPorcelain,
	worktreeDisplayName,
} from "./git-parsers";
import { runCmdSync } from "./process";

export class GitManager {
	private readonly _logger: ILogger;
	private readonly _fs: IFsManager;

	public constructor(logger: ILogger, fs: IFsManager) {
		this._logger = logger;
		this._fs = fs;
	}

	public scanGitRepositories(workspacePath: string): RepositoryDto[] {
		this._logger.info(`[GitManager] start git scan on`, workspacePath);
		const scanResult = this.collectRepositories(workspacePath);
		if (scanResult.isError) {
			this._logger.error("[GitManager] unable to scan git repositories", scanResult.error);
			return [];
		}

		this._logger.info(
			`[GitManager] scanned ${scanResult.data.length} repositories in ${workspacePath}`,
		);
		return scanResult.data;
	}

	private collectRepositories(workspacePath: string): Result<RepositoryDto[]> {
		const rootPathExistResult = this._fs.existsSync(workspacePath);
		if (rootPathExistResult.isError || !rootPathExistResult.data) {
			this._logger.error(
				"[GitManager] unable to read workspace at",
				workspacePath,
				rootPathExistResult.error,
			);
			return {
				isError: true,
				error: rootPathExistResult.error ?? new Error("path does not exist"),
			};
		}

		const gitRefs = this._fs.findAtExactDepthSync(workspacePath, ".git", "dir", 1);
		const repositories: RepositoryDto[] = [];

		for (const gitRef of gitRefs) {
			const repoPath = dirname(gitRef);
			const repoResult = this.buildRepositoryDto(repoPath);
			if (repoResult.isError) {
				this._logger.error("[GitManager] unable to build repository", gitRef, repoResult.error);
				continue;
			}

			const worktreeResult = this.collectWorktreesWithStats(repoPath);
			if (worktreeResult.isError) {
				this._logger.error(
					"[GitManager] unable to collect worktrees",
					repoPath,
					worktreeResult.error,
				);
				repositories.push({ ...repoResult.data, worktrees: [] });
				continue;
			}

			repositories.push({ ...repoResult.data, worktrees: worktreeResult.data });
		}

		return { isSuccess: true, data: repositories };
	}

	private buildRepositoryDto(repoPath: string): Result<RepositoryDto> {
		const branchResult = runCmdSync(repoPath, "git", "symbolic-ref", "--short", "HEAD");
		if (branchResult.isError) return { isError: true, error: branchResult.error };

		return {
			isSuccess: true,
			data: {
				path: repoPath,
				name: basename(repoPath),
				branch: branchResult.data,
				worktrees: [],
			},
		};
	}

	private collectWorktreesWithStats(repoPath: string): Result<WorktreeDto[]> {
		const worktreeResult = runCmdSync(repoPath, "git", "worktree", "list", "--porcelain");
		if (worktreeResult.isError) return { isError: true, error: worktreeResult.error };

		const worktrees: WorktreeDto[] = [];

		for (const parsed of parseWorktreeListPorcelain(worktreeResult.data)) {
			const baseWorktree: WorktreeDto = {
				path: parsed.path,
				name: worktreeDisplayName(parsed),
				filesModified: 0,
				linesAdded: 0,
				linesRemoved: 0,
			};

			const statsResult = this.computeWorktreeChangeStats(baseWorktree);
			if (statsResult.isError) {
				return { isError: true, error: statsResult.error };
			}

			worktrees.push(statsResult.data);
		}

		return { isSuccess: true, data: worktrees };
	}

	private computeWorktreeChangeStats(worktree: WorktreeDto): Result<WorktreeDto> {
		let statResult = runCmdSync(worktree.path, "git", "diff", "HEAD", "--shortstat");
		if (statResult.isError) {
			if (isMissingHeadError(statResult.error)) {
				this._logger.warn(
					"[GitManager] no HEAD on worktree, falling back to staged diff",
					worktree.path,
				);
				statResult = runCmdSync(worktree.path, "git", "diff", "--cached", "--shortstat");
			} else {
				this._logger.error("[GitManager] unable to diff worktree", worktree.path, statResult.error);
				return { isError: true, error: statResult.error };
			}
		}

		if (statResult.isError) {
			this._logger.error("[GitManager] unable to diff worktree", worktree.path, statResult.error);
			return { isError: true, error: statResult.error };
		}

		const untrackedResult = runCmdSync(
			worktree.path,
			"git",
			"ls-files",
			"--others",
			"--exclude-standard",
		);
		if (untrackedResult.isError) {
			this._logger.error(
				"[GitManager] unable to list untracked files",
				worktree.path,
				untrackedResult.error,
			);
			return { isError: true, error: untrackedResult.error };
		}

		const shortstat = parseShortstat(statResult.data);

		return {
			isSuccess: true,
			data: {
				...worktree,
				filesModified: shortstat.filesModified + countUntrackedFiles(untrackedResult.data),
				linesAdded: shortstat.linesAdded,
				linesRemoved: shortstat.linesRemoved,
			},
		};
	}
}
