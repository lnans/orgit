import { existsSync } from "node:fs";
import path from "node:path";
import type {
	CreateRepositoryParams,
	CreateRepositoryResult,
} from "../../../shared/create-repository";
import { normalizeFolderName } from "../../../shared/folder-name";
import { logger } from "../../lib/logger";
import { isRepositoryRoot } from "./git";
import { runGitAsync } from "./git/run";

export type CreateRepositorySuccess = {
	repositoryPath: string;
};

/**
 * Clone a repository into the workspace.
 * Returns the resolved repository root path on success.
 */
export async function executeCreateRepository(
	workspacePath: string,
	params: CreateRepositoryParams,
): Promise<CreateRepositoryResult & { paths?: CreateRepositorySuccess }> {
	const source = params.source.trim();
	if (source.length === 0) {
		return { ok: false, error: "invalid_repository_source" };
	}

	const folderNormalized = normalizeFolderName(params.folderName);
	if (!folderNormalized.ok) {
		return { ok: false, error: "invalid_folder_name" };
	}

	return cloneRepository(workspacePath, source, folderNormalized.value);
}

async function cloneRepository(
	workspacePath: string,
	source: string,
	folderName: string,
): Promise<CreateRepositoryResult & { paths?: CreateRepositorySuccess }> {
	const repositoryPath = path.join(workspacePath, folderName);
	if (existsSync(repositoryPath)) {
		logger.warn(`Clone destination already exists: ${repositoryPath}`);
		return { ok: false, error: "destination_exists" };
	}

	const result = await runGitAsync(workspacePath, [
		"clone",
		source,
		folderName,
	]);
	if (!result.ok) {
		logger.error(
			`git clone failed (exit ${result.status}): ${result.stdout}`,
			result.args,
		);
		return {
			ok: false,
			error: "clone_failed",
			detail: result.stdout || undefined,
		};
	}

	if (!isRepositoryRoot(repositoryPath)) {
		return {
			ok: false,
			error: "clone_failed",
			detail: "cloned path is not a repository root",
		};
	}

	return {
		ok: true,
		paths: { repositoryPath: path.resolve(repositoryPath) },
	};
}
