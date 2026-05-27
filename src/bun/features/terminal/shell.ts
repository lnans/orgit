import path from "node:path";

export function getDefaultShell(): string {
	return process.env.SHELL ?? "/bin/zsh";
}

export function getShellArgs(shellPath: string): string[] {
	const name = path.basename(shellPath);
	if (name === "zsh" || name === "bash") {
		return ["-l"];
	}
	return [];
}
