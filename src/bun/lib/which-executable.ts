import { resolveMergedPath } from "./resolve-login-path";

/** Resolve the first executable found on PATH, including the login-shell PATH. */
export function whichExecutable(...names: string[]): string | null {
	for (const name of names) {
		const found = Bun.which(name);
		if (found) {
			return found;
		}
	}

	const mergedPath = resolveMergedPath();
	if (!mergedPath) {
		return null;
	}

	for (const name of names) {
		const found = Bun.which(name, { PATH: mergedPath });
		if (found) {
			return found;
		}
	}

	return null;
}
