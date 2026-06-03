export type CreateWorktreeNewBranchParams = {
	mode?: "new";
	/** Repository root path (must be an existing workspace repo). */
	repositoryPath: string;
	/** New branch name (validated with {@link resolveWorktreeCheckout} using the repo basename). */
	branchName: string;
};

export type CreateWorktreeExistingBranchParams = {
	mode: "existing";
	/** Repository root path (must be an existing workspace repo). */
	repositoryPath: string;
	/** Remote-tracking ref to check out, e.g. `origin/feature/foo`. */
	remoteBranch: string;
};

export type CreateWorktreeParams =
	| CreateWorktreeNewBranchParams
	| CreateWorktreeExistingBranchParams;

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
