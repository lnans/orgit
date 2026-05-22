/** Shallow equality for string-keyed records (e.g. selected worktree paths). */
export function shallowEqualRecord(
	a: Record<string, string>,
	b: Record<string, string>,
): boolean {
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (const key of keysA) {
		if (a[key] !== b[key]) {
			return false;
		}
	}

	return true;
}
