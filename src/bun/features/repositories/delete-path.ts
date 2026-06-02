import { existsSync, rmSync } from "node:fs";

/** Removes a directory tree when it still exists on disk. */
export function removeDirectoryIfExists(targetPath: string): void {
	if (existsSync(targetPath)) {
		rmSync(targetPath, { recursive: true, force: true });
	}
}
