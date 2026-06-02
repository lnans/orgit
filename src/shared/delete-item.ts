export type DeleteWorktreeParams = {
	kind: "worktree";
	/** Repository root that owns the linked worktree. */
	repositoryPath: string;
	worktreePath: string;
};

export type DeleteRepositoryParams = {
	kind: "repository";
	repositoryPath: string;
};

export type DeleteItemParams = DeleteWorktreeParams | DeleteRepositoryParams;

export type DeleteItemErrorCode =
	| "invalid_repository"
	| "invalid_worktree"
	| "not_found"
	| "worktree_remove_failed"
	| "repository_remove_failed";

export type DeleteItemResult =
	| { ok: true }
	| {
			ok: false;
			error: DeleteItemErrorCode;
			detail?: string;
	  };
