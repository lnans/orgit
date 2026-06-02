/** True when a `fs.watch` filename should not trigger diff-stat refresh. */
export function shouldIgnoreWatchEvent(
	filename: string | Buffer | null,
): boolean {
	if (filename === null) {
		return false;
	}

	const name = String(filename);
	if (!name) {
		return false;
	}

	const parts = name.split(/[/\\]/).filter(Boolean);
	return parts.some((part) => part === "node_modules" || part === ".git");
}
