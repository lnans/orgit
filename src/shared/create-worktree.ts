export type CreateWorktreeParams = {
	/** Repository root path (must be an existing workspace repo). */
	repositoryPath: string;
	/** New branch name (validated with {@link resolveWorktreeCheckout} using the repo basename). */
	branchName: string;
};

export type CreateWorktreeErrorCode =
	| "destination_exists"
	| "worktree_failed"
	| "invalid_branch_name"
	| "invalid_worktree_folder_name"
	| "invalid_repository";

export type CreateWorktreeResult =
	| { ok: true }
	| {
			ok: false;
			error: CreateWorktreeErrorCode;
			detail?: string;
	  };
