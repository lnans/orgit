import path from "node:path";
import { logger } from "../../../lib/logger";
import { findDotNetSolutionFile } from "./find-dotnet-solution";
import { spawnDetached } from "./spawn-detached";

/** Open the first solution file under the worktree in JetBrains Rider. */
export function openInRider(worktreePath: string): void {
	const solutionPath = findDotNetSolutionFile(worktreePath);
	if (!solutionPath) {
		logger.warn(
			`No .sln or .slnx found under ${worktreePath}; Rider not opened.`,
		);
		return;
	}

	const resolvedSolution = path.resolve(solutionPath);
	const riderCli =
		Bun.which("rider") ?? Bun.which("rider.bat") ?? Bun.which("rider64.exe");

	if (riderCli) {
		spawnDetached([riderCli, resolvedSolution]);
		return;
	}

	if (process.platform === "darwin") {
		spawnDetached(["open", "-a", "JetBrains Rider", resolvedSolution]);
		return;
	}

	if (process.platform === "win32") {
		spawnDetached(["cmd", "/c", "start", "", "rider64", resolvedSolution]);
		return;
	}

	logger.warn(
		`Could not open Rider for ${resolvedSolution}: Rider CLI not found and no platform fallback.`,
	);
}
