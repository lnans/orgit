/** Characters invalid in file/folder names on Windows (also invalid or problematic elsewhere). */
const INVALID_FOLDER_NAME_CHARS = /[<>:"/\\|?*]/g;

/** Windows reserved device names (lowercase), without extension. */
const WINDOWS_RESERVED_NAMES = new Set([
	"con",
	"prn",
	"aux",
	"nul",
	"com1",
	"com2",
	"com3",
	"com4",
	"com5",
	"com6",
	"com7",
	"com8",
	"com9",
	"lpt1",
	"lpt2",
	"lpt3",
	"lpt4",
	"lpt5",
	"lpt6",
	"lpt7",
	"lpt8",
	"lpt9",
]);

const DEFAULT_REPLACEMENT = "-";

/** Max length of a single folder/path segment (Windows limit). */
export const FOLDER_NAME_MAX_LENGTH = 255;
const DEFAULT_MAX_LENGTH = FOLDER_NAME_MAX_LENGTH;

/** Error reasons returned by {@link normalizeFolderName}. Keys match `folderName.error.*` in locales. */
export const NORMALIZE_FOLDER_NAME_ERROR_REASONS = [
	"empty_input",
	"dot_segment",
	"empty_after_normalize",
	"name_too_long",
] as const;

export type NormalizeFolderNameErrorReason =
	(typeof NORMALIZE_FOLDER_NAME_ERROR_REASONS)[number];

export type NormalizeFolderNameError = {
	reason: NormalizeFolderNameErrorReason;
};

export type NormalizeFolderNameResult =
	| { ok: true; value: string }
	| { ok: false; error: NormalizeFolderNameError };

export type NormalizeFolderNameOptions = {
	/** Substitute for invalid characters. Default: `"-"`. */
	replacement?: string;
	/** Max length of the result (Windows path segment limit). Default: `255`. */
	maxLength?: number;
};

/** i18next key for a {@link NormalizeFolderNameErrorReason} (e.g. `folderName.error.empty_input`). */
export function normalizeFolderNameErrorI18nKey(
	reason: NormalizeFolderNameErrorReason,
): `folderName.error.${NormalizeFolderNameErrorReason}` {
	return `folderName.error.${reason}`;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceControlCharacters(value: string, replacement: string): string {
	let result = "";
	for (const char of value) {
		result += char.charCodeAt(0) < 32 ? replacement : char;
	}
	return result;
}

function stripWindowsTrailingDotsAndSpaces(name: string): string {
	return name.replace(/[.\s]+$/g, "");
}

function isWindowsReservedName(name: string): boolean {
	const base = name.includes(".") ? (name.split(".")[0] ?? name) : name;
	return WINDOWS_RESERVED_NAMES.has(base);
}

function err(
	reason: NormalizeFolderNameErrorReason,
): NormalizeFolderNameResult {
	return { ok: false, error: { reason } };
}

/**
 * Normalize a string so it can be used as a single folder name on Windows, macOS, and Linux.
 *
 * - Strips leading/trailing whitespace
 * - Replaces `<>:"/\\|?*` and control characters
 * - Collapses repeated replacements
 * - Trims trailing dots and spaces (Windows)
 * - Lowercases the result (avoids case-sensitive vs insensitive filesystem clashes)
 * - Avoids `.`, `..`, and Windows reserved device names (`con`, `com1`, …) via `_` suffix
 */
export function normalizeFolderName(
	input: string,
	options: NormalizeFolderNameOptions = {},
): NormalizeFolderNameResult {
	const replacement = options.replacement ?? DEFAULT_REPLACEMENT;
	const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

	let name = input.trim();
	if (name.length === 0) {
		return err("empty_input");
	}

	const lowerTrimmed = name.toLowerCase();
	if (lowerTrimmed === "." || lowerTrimmed === "..") {
		return err("dot_segment");
	}

	name = replaceControlCharacters(
		name.replace(INVALID_FOLDER_NAME_CHARS, replacement),
		replacement,
	);

	if (replacement.length > 0) {
		const repeated = new RegExp(`${escapeRegExp(replacement)}+`, "g");
		name = name.replace(repeated, replacement);
		const edge = new RegExp(
			`^${escapeRegExp(replacement)}+|${escapeRegExp(replacement)}+$`,
			"g",
		);
		name = name.replace(edge, "");
	}

	name = stripWindowsTrailingDotsAndSpaces(name).toLowerCase();

	if (name.length === 0) {
		return err("empty_after_normalize");
	}

	if (isWindowsReservedName(name)) {
		name = `${name}_`;
	}

	name = stripWindowsTrailingDotsAndSpaces(name);

	if (name.length === 0) {
		return err("empty_after_normalize");
	}

	if (name.length > maxLength) {
		return err("name_too_long");
	}

	return { ok: true, value: name };
}
