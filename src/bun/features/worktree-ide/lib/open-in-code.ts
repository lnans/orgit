import path from "node:path";
import { logger } from "../../../lib/logger";
import { whichExecutable } from "../../../lib/which-executable";
import { spawnDetached } from "./spawn-detached";

/** Open the worktree folder in Visual Studio Code. */
export function openInCode(worktreePath: string): void {
	const cwd = path.resolve(worktreePath);
	const codeCli = whichExecutable("code");

	if (codeCli) {
		spawnDetached([codeCli, cwd], { cwd });
		return;
	}

	if (process.platform === "darwin") {
		spawnDetached(["/usr/bin/open", "-a", "Visual Studio Code", cwd]);
		return;
	}

	if (process.platform === "win32") {
		spawnDetached(["cmd", "/c", "start", "", "code", cwd]);
		return;
	}

	logger.warn(
		`Could not open VS Code for ${cwd}: "code" CLI not found and no platform fallback.`,
	);
}
