import { spawnSync } from "bun";
import type { Result } from "@/server/types/server.types";

export function runCmdSync(cwd: string, ...args: string[]): Result<string> {
	const { stdout, stderr, exitCode } = spawnSync(args, {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});

	if (exitCode !== 0) {
		return {
			isError: true,
			error: new Error(stderr.toString().trim() || `Process exited with code ${exitCode}`),
		};
	}

	return {
		isSuccess: true,
		data: stdout.toString().trim(),
	};
}
