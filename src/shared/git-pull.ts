export type GitPullParams = {
	/** Repository root or linked worktree checkout to pull in. */
	checkoutPath: string;
	/** Webview key for per-card loading UI (repo or worktree path). */
	loadingKey: string;
};

export type GitPullResult = { ok: true } | { ok: false; message: string };
