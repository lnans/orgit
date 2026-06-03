import path from "node:path";
import { logger } from "../../../lib/logger";
import { findDotNetSolutionFile } from "./find-dotnet-solution";
import { macOsOpenRiderAttempts, resolveRiderCli } from "./rider-launch";
import { spawnDetached } from "./spawn-detached";

function trySpawnSync(command: string[]): boolean {
	try {
		const proc = Bun.spawnSync(command, {
			stdout: "ignore",
			stderr: "ignore",
		});
		return proc.exitCode === 0;
	} catch {
		return false;
	}
}

function openRiderOnMac(resolvedSolution: string): boolean {
	const riderCli = resolveRiderCli();
	if (riderCli) {
		spawnDetached([riderCli, resolvedSolution]);
		return true;
	}

	for (const argv of macOsOpenRiderAttempts(resolvedSolution)) {
		if (trySpawnSync(argv)) {
			return true;
		}
	}

	return false;
}

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

	if (process.platform === "darwin") {
		if (openRiderOnMac(resolvedSolution)) {
			return;
		}

		logger.warn(
			`Could not open Rider for ${resolvedSolution}: Rider CLI not found and macOS open fallbacks failed.`,
		);
		return;
	}

	const riderCli = resolveRiderCli();
	if (riderCli) {
		spawnDetached([riderCli, resolvedSolution]);
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
