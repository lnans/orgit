import { execFileSync } from "node:child_process";

export const DETACHED_HEAD = "(detached)";
export const UNKNOWN_BRANCH = "(unknown)";

/** Git empty tree — valid baseline for repos with no commits yet. */
export const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

export type GitResult =
	| { ok: true; stdout: string }
	| { ok: false; status: number; stdout: string; args: string[] };

export function runGit(cwd: string, args: string[]): GitResult {
	try {
		const stdout = execFileSync("git", args, {
			cwd,
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		});
		return { ok: true, stdout: stdout.trim() };
	} catch (error) {
		const err = error as { stdout?: string | Buffer; status?: number };
		const stdout =
			typeof err.stdout === "string"
				? err.stdout
				: (err.stdout?.toString() ?? "");
		return {
			ok: false,
			status: err.status ?? 1,
			stdout: stdout.trim(),
			args,
		};
	}
}

export async function runGitAsync(
	cwd: string,
	args: string[],
): Promise<GitResult> {
	try {
		const proc = Bun.spawn(["git", ...args], {
			cwd,
			stdout: "pipe",
			stderr: "ignore",
		});
		const stdout = await new Response(proc.stdout).text();
		const status = await proc.exited;
		const trimmed = stdout.trim();

		if (status === 0) {
			return { ok: true, stdout: trimmed };
		}

		return { ok: false, status, stdout: trimmed, args };
	} catch {
		return { ok: false, status: 1, stdout: "", args };
	}
}
