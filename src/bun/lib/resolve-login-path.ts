import { getDefaultShell, getShellArgs } from "../features/terminal/shell";

let cachedLoginPath: string | null | undefined;

/** PATH from the user's login shell (GUI .app launches often omit profile dirs). */
export function resolveLoginShellPath(): string | undefined {
	if (cachedLoginPath !== undefined) {
		return cachedLoginPath || undefined;
	}

	const shell = getDefaultShell();
	const args = [...getShellArgs(shell), "-c", 'printf %s "$PATH"'];

	try {
		const proc = Bun.spawnSync([shell, ...args], {
			env: { ...process.env, TERM: "dumb" },
			stdout: "pipe",
			stderr: "ignore",
		});
		if (proc.exitCode !== 0) {
			cachedLoginPath = "";
			return undefined;
		}

		const value = proc.stdout.toString().trim();
		cachedLoginPath = value;
		return value || undefined;
	} catch {
		cachedLoginPath = "";
		return undefined;
	}
}

/** `process.env.PATH` merged with the login-shell PATH (login segments first). */
export function resolveMergedPath(): string {
	const loginPath = resolveLoginShellPath();
	const current = process.env.PATH ?? "";
	if (!loginPath) {
		return current;
	}

	const seen = new Set<string>();
	const merged: string[] = [];

	for (const segment of `${loginPath}:${current}`.split(":")) {
		if (!segment || seen.has(segment)) {
			continue;
		}
		seen.add(segment);
		merged.push(segment);
	}

	return merged.join(":");
}
