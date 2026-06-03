import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { whichExecutable } from "../../../lib/which-executable";

export const RIDER_MAC_BUNDLE_ID = "com.jetbrains.rider";

/** macOS application names accepted by `open -a` (Toolbox vs direct install). */
export const RIDER_MAC_APP_NAMES = ["Rider", "JetBrains Rider"] as const;

/** Rider CLI binaries shipped inside common macOS .app bundles. */
export function macOsBundledRiderCliCandidates(
	homeDir: string = homedir(),
): string[] {
	return [
		"/Applications/Rider.app/Contents/MacOS/rider",
		"/Applications/JetBrains Rider.app/Contents/MacOS/rider",
		path.join(homeDir, "Applications/Rider.app/Contents/MacOS/rider"),
		path.join(homeDir, "Applications/JetBrains Rider.app/Contents/MacOS/rider"),
	];
}

/** Ordered `open` attempts for a solution file when no Rider CLI is available. */
export function macOsOpenRiderAttempts(solutionPath: string): string[][] {
	const attempts: string[][] = [
		["/usr/bin/open", "-b", RIDER_MAC_BUNDLE_ID, solutionPath],
	];

	for (const appName of RIDER_MAC_APP_NAMES) {
		attempts.push(["/usr/bin/open", "-a", appName, solutionPath]);
	}

	return attempts;
}

/** Resolve a Rider CLI binary, including paths not on the GUI app PATH. */
export function resolveRiderCli(): string | null {
	const fromPath = whichExecutable("rider", "rider.bat", "rider64.exe");
	if (fromPath) {
		return fromPath;
	}

	if (process.platform !== "darwin") {
		return null;
	}

	for (const candidate of macOsBundledRiderCliCandidates()) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return null;
}
