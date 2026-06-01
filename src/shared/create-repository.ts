export type CreateRepositoryParams = {
	/** Clone URL or filesystem path. */
	source: string;
	/** Workspace folder name ({@link normalizeFolderName}). */
	folderName: string;
};

export type CreateRepositoryErrorCode =
	| "destination_exists"
	| "clone_failed"
	| "invalid_repository_source"
	| "invalid_folder_name";

export type CreateRepositoryResult =
	| { ok: true }
	| {
			ok: false;
			error: CreateRepositoryErrorCode;
			detail?: string;
	  };
