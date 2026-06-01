const DEFAULT_REPLACEMENT = "-";

function isForbiddenGitRefCodePoint(code: number): boolean {
	return (
		code <= 0x1f ||
		(code >= 0x7f && code <= 0x9f) ||
		code === 0x20 ||
		code === 0x7e ||
		code === 0x5e ||
		code === 0x3a ||
		code === 0x3f ||
		code === 0x2a ||
		code === 0x5b ||
		code === 0x5c
	);
}

function replaceForbiddenGitRefChars(
	value: string,
	replacement: string,
): string {
	let result = "";
	for (const char of value) {
		result += isForbiddenGitRefCodePoint(char.charCodeAt(0))
			? replacement
			: char;
	}
	return result;
}

function hasForbiddenGitRefChars(value: string): boolean {
	for (const char of value) {
		if (isForbiddenGitRefCodePoint(char.charCodeAt(0))) {
			return true;
		}
	}
	return false;
}

/**
 * Error reasons returned by {@link normalizeBranchName}.
 * Keys match `branchName.error.*` in locales.
 *
 * - `dot_segment` — `..` anywhere, `.` / `..` segment, or empty segment (`//`, trailing `/`).
 * - `starts_with_dot` — leading `.` or `/`, or a segment starting with `.`.
 */
export const NORMALIZE_BRANCH_NAME_ERROR_REASONS = [
	"empty_input",
	"dot_segment",
	"starts_with_dot",
	"ends_with_dot",
	"ends_with_lock",
	"contains_at_brace",
	"empty_after_normalize",
] as const;

export type NormalizeBranchNameErrorReason =
	(typeof NORMALIZE_BRANCH_NAME_ERROR_REASONS)[number];

export type NormalizeBranchNameError = {
	reason: NormalizeBranchNameErrorReason;
};

export type NormalizeBranchNameResult =
	| { ok: true; value: string }
	| { ok: false; error: NormalizeBranchNameError };

export type NormalizeBranchNameOptions = {
	/** Substitute for forbidden characters. Default: `"-"`. */
	replacement?: string;
};

/** i18next key for a {@link NormalizeBranchNameErrorReason}. */
export function normalizeBranchNameErrorI18nKey(
	reason: NormalizeBranchNameErrorReason,
): `branchName.error.${NormalizeBranchNameErrorReason}` {
	return `branchName.error.${reason}`;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function err(
	reason: NormalizeBranchNameErrorReason,
): NormalizeBranchNameResult {
	return { ok: false, error: { reason } };
}

function validateBranchStructure(
	name: string,
): NormalizeBranchNameResult | null {
	if (name.includes("..")) {
		return err("dot_segment");
	}

	if (name.includes("@{")) {
		return err("contains_at_brace");
	}

	if (name.endsWith(".lock")) {
		return err("ends_with_lock");
	}

	if (name.endsWith(".")) {
		return err("ends_with_dot");
	}

	if (name.startsWith(".") || name.startsWith("/")) {
		return err("starts_with_dot");
	}

	for (const segment of name.split("/")) {
		if (segment.length === 0) {
			return err("dot_segment");
		}
		if (segment === "." || segment === "..") {
			return err("dot_segment");
		}
		if (segment.startsWith(".")) {
			return err("starts_with_dot");
		}
		if (segment.endsWith(".lock")) {
			return err("ends_with_lock");
		}
		if (segment.endsWith(".")) {
			return err("ends_with_dot");
		}
	}

	return null;
}

/**
 * Sanitize a string for use as a Git branch name.
 *
 * Preserves casing and `/` (for hierarchical branch names). Replaces only
 * characters invalid in refs (`git check-ref-format` rules). Does not apply
 * filesystem folder rules — use {@link normalizeFolderName} for checkout paths.
 */
export function normalizeBranchName(
	input: string,
	options: NormalizeBranchNameOptions = {},
): NormalizeBranchNameResult {
	const replacement = options.replacement ?? DEFAULT_REPLACEMENT;
	const trimmed = input.trim();

	if (trimmed.length === 0) {
		return err("empty_input");
	}

	const structuralError = validateBranchStructure(trimmed);
	if (structuralError) {
		return structuralError;
	}

	if (!hasForbiddenGitRefChars(trimmed)) {
		return { ok: true, value: trimmed };
	}

	let name = replaceForbiddenGitRefChars(trimmed, replacement);

	if (replacement.length > 0) {
		const repeated = new RegExp(`${escapeRegExp(replacement)}+`, "g");
		name = name.replace(repeated, replacement);
		const edge = new RegExp(
			`^${escapeRegExp(replacement)}+|${escapeRegExp(replacement)}+$`,
			"g",
		);
		name = name.replace(edge, "");
		name = name.replace(/\/{2,}/g, "/");
		name = name.replace(/^\/+|\/+$/g, "");
	}

	if (name.length === 0) {
		return err("empty_after_normalize");
	}

	const afterReplaceError = validateBranchStructure(name);
	if (afterReplaceError) {
		return afterReplaceError;
	}

	return { ok: true, value: name };
}
