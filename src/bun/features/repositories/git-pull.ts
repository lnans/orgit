import type { GitPullResult } from "../../../shared/git-pull";
import { logger } from "../../lib/logger";
import { getCurrentBranch } from "./git";

async function runGitLogged(
	checkoutPath: string,
	args: string[],
): Promise<{ ok: boolean; status: number; output: string }> {
	const branch = getCurrentBranch(checkoutPath);
	logger.info(`git ${args.join(" ")} (${checkoutPath}, branch ${branch})`);

	const proc = Bun.spawn(["git", ...args], {
		cwd: checkoutPath,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	const status = await proc.exited;
	const output = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n");

	if (output) {
		if (status === 0) {
			logger.info(output);
		} else {
			logger.error(output);
		}
	}

	return { ok: status === 0, status, output };
}

/** `git pull --rebase` on the current branch at the given checkout. */
export async function executeGitPull(
	checkoutPath: string,
): Promise<GitPullResult> {
	const pull = await runGitLogged(checkoutPath, ["pull", "--rebase"]);
	if (!pull.ok) {
		return {
			ok: false,
			message: `git pull --rebase failed (exit ${pull.status}).`,
		};
	}

	return { ok: true };
}
