export type RemoteBranchOption = {
	/** Remote-tracking ref, e.g. `origin/feature/foo`. */
	ref: string;
	/** Local branch name without remote prefix, e.g. `feature/foo`. */
	branchName: string;
};

export type ListRemoteBranchesParams = {
	repositoryPath: string;
};

export type ListRemoteBranchesErrorCode =
	| "invalid_repository"
	| "list_failed"
	| "no_remote";

export type ListRemoteBranchesResult =
	| { ok: true; branches: RemoteBranchOption[] }
	| {
			ok: false;
			error: ListRemoteBranchesErrorCode;
			detail?: string;
	  };
