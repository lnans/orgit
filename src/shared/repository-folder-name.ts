import {
	type NormalizeFolderNameResult,
	normalizeFolderName,
} from "./folder-name";

/**
 * Derive a workspace folder name from a clone URL or filesystem path.
 * Uses the last path segment (after `/`, `\`, or `:`), strips `.git`, then
 * {@link normalizeFolderName}.
 */
export function deriveRepositoryFolderName(
	source: string,
): NormalizeFolderNameResult {
	let name = source.trim();
	if (name.length === 0) {
		return normalizeFolderName(name);
	}

	if (name.startsWith("file://")) {
		name = name.slice("file://".length);
	}

	name = name.replace(/\\/g, "/");

	const segments = name.split(/[/:]/).filter((segment) => segment.length > 0);
	name = segments.at(-1) ?? name;

	if (name.toLowerCase().endsWith(".git")) {
		name = name.slice(0, -4);
	}

	return normalizeFolderName(name);
}
