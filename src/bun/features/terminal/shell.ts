import { existsSync } from "node:fs";
import { userInfo } from "node:os";
import path from "node:path";

const FALLBACK_SHELLS = ["/bin/zsh", "/bin/bash", "/bin/sh"];

function isExecutableShell(shellPath: string | undefined): shellPath is string {
	if (!shellPath?.trim()) {
		return false;
	}
	return existsSync(path.resolve(shellPath.trim()));
}

/** macOS login shell from directory service (works when SHELL is unset in .app). */
function readMacOsUserShell(): string | undefined {
	if (process.platform !== "darwin") {
		return undefined;
	}

	try {
		const username = userInfo().username;
		const proc = Bun.spawnSync([
			"/usr/bin/dscl",
			".",
			"-read",
			`/Users/${username}`,
			"UserShell",
		]);
		if (proc.exitCode !== 0) {
			return undefined;
		}
		const stdout = proc.stdout.toString();
		const match = stdout.match(/UserShell:\s*(.+)/);
		return match?.[1]?.trim();
	} catch {
		return undefined;
	}
}

/** Ordered shell candidates for PTY spawn; first executable wins. */
export function resolveShellCandidates(): string[] {
	const seen = new Set<string>();
	const candidates: string[] = [];

	const add = (shell: string | undefined) => {
		if (!shell?.trim()) {
			return;
		}
		const resolved = path.resolve(shell.trim());
		if (seen.has(resolved)) {
			return;
		}
		seen.add(resolved);
		candidates.push(resolved);
	};

	for (const name of ["zsh", "bash", "sh"]) {
		add(Bun.which(name) ?? undefined);
	}

	add(process.env.SHELL);
	add(readMacOsUserShell());

	for (const shell of FALLBACK_SHELLS) {
		add(shell);
	}

	return candidates;
}

export function getDefaultShell(): string {
	for (const shell of resolveShellCandidates()) {
		if (isExecutableShell(shell)) {
			return shell;
		}
	}
	return "/bin/sh";
}

export function getShellArgs(shellPath: string): string[] {
	const name = path.basename(shellPath);
	if (name === "zsh" || name === "bash") {
		return ["-l"];
	}
	return [];
}
