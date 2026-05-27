/** Used when no workspace/worktree path is available (main process resolves cwd). */
export const DEFAULT_TERMINAL_SESSION_KEY = "__orgit_default__";

/** Stable id for a terminal tab; equals the shell working directory when known. */
export function getTerminalSessionKey(
	workspacePath: string,
	worktreePath: string | undefined,
): string {
	if (worktreePath) {
		return worktreePath;
	}
	if (workspacePath) {
		return workspacePath;
	}
	return DEFAULT_TERMINAL_SESSION_KEY;
}
