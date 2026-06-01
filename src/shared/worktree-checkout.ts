import {
	type NormalizeBranchNameErrorReason,
	normalizeBranchName,
} from "./branch-name";
import {
	FOLDER_NAME_MAX_LENGTH,
	type NormalizeFolderNameErrorReason,
	normalizeFolderName,
} from "./folder-name";

export type ResolveWorktreeCheckoutFolderErrorReason =
	| NormalizeFolderNameErrorReason
	| "worktree_combined_name_too_long";

export type ResolveWorktreeCheckoutError =
	| { field: "branch"; reason: NormalizeBranchNameErrorReason }
	| {
			field: "folder";
			reason: ResolveWorktreeCheckoutFolderErrorReason;
			maxSegmentLength?: number;
	  };

export type ResolveWorktreeCheckoutResult =
	| { ok: true; branchName: string; folderName: string }
	| { ok: false; error: ResolveWorktreeCheckoutError };

export type ResolveWorktreeCheckoutOptions = {
	/** Repository folder basename prepended as `{basename}-{folderName}`. */
	repositoryBasename?: string;
};

const WORKTREE_FOLDER_SEPARATOR = "-";
const UNDERSCORE_MARKER = "_underscore_";
const SLASH_MARKER = "_slash_";
const DASH_MARKER = "_dash_";

/** Last path segment of a repository root (supports `/` and `\\`). */
export function repositoryPathBasename(repositoryPath: string): string {
	const trimmed = repositoryPath.trim().replace(/[/\\]+$/, "");
	const lastSep = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
	return lastSep === -1 ? trimmed : trimmed.slice(lastSep + 1);
}

/** Max length allowed for the branch-derived segment given a repository basename. */
export function maxWorktreeCheckoutSegmentLength(
	repositoryBasename: string,
): number {
	return Math.max(
		0,
		FOLDER_NAME_MAX_LENGTH -
			repositoryBasename.length -
			WORKTREE_FOLDER_SEPARATOR.length,
	);
}

/** Final worktree directory name under the workspace: `{repositoryBasename}-{folderSegment}`. */
export function formatWorktreeFolderName(
	repositoryBasename: string,
	folderSegment: string,
): string {
	return `${repositoryBasename}${WORKTREE_FOLDER_SEPARATOR}${folderSegment}`;
}

/**
 * Encode `/`, `-`, and `_` in a Git branch name so distinct branches map to
 * distinct folder segments before {@link normalizeFolderName} (e.g. `a/b` vs
 * `a-b`, and `a/b` vs `a_slash_b`). Underscores are escaped first so marker
 * substrings in the original name cannot collide with encoded slashes or dashes.
 */
export function encodeBranchNameForFolderSegment(branchName: string): string {
	return branchName
		.replace(/_/g, UNDERSCORE_MARKER)
		.replace(/-/g, DASH_MARKER)
		.replace(/\//g, SLASH_MARKER);
}

/**
 * Validate a worktree branch name and derive the on-disk checkout folder segment.
 *
 * Git uses {@link normalizeBranchName}; the workspace path suffix uses
 * {@link normalizeFolderName} on {@link encodeBranchNameForFolderSegment} output.
 * When {@link ResolveWorktreeCheckoutOptions.repositoryBasename} is set, the
 * segment length is capped so `{basename}-{segment}` fits in one path segment.
 */
export function resolveWorktreeCheckout(
	branchNameInput: string,
	options: ResolveWorktreeCheckoutOptions = {},
): ResolveWorktreeCheckoutResult {
	const branch = normalizeBranchName(branchNameInput);
	if (!branch.ok) {
		return {
			ok: false,
			error: { field: "branch", reason: branch.error.reason },
		};
	}

	const repositoryBasename = options.repositoryBasename?.trim();
	const maxSegmentLength =
		repositoryBasename && repositoryBasename.length > 0
			? maxWorktreeCheckoutSegmentLength(repositoryBasename)
			: undefined;

	if (maxSegmentLength !== undefined && maxSegmentLength < 1) {
		return {
			ok: false,
			error: {
				field: "folder",
				reason: "worktree_combined_name_too_long",
				maxSegmentLength: 0,
			},
		};
	}

	const folder = normalizeFolderName(
		encodeBranchNameForFolderSegment(branch.value),
		maxSegmentLength !== undefined ? { maxLength: maxSegmentLength } : {},
	);
	if (!folder.ok) {
		if (
			folder.error.reason === "name_too_long" &&
			maxSegmentLength !== undefined
		) {
			return {
				ok: false,
				error: {
					field: "folder",
					reason: "worktree_combined_name_too_long",
					maxSegmentLength,
				},
			};
		}
		return {
			ok: false,
			error: { field: "folder", reason: folder.error.reason },
		};
	}

	if (repositoryBasename && repositoryBasename.length > 0) {
		const combined = formatWorktreeFolderName(repositoryBasename, folder.value);
		if (combined.length > FOLDER_NAME_MAX_LENGTH) {
			return {
				ok: false,
				error: {
					field: "folder",
					reason: "worktree_combined_name_too_long",
					maxSegmentLength: maxSegmentLength ?? 0,
				},
			};
		}
	}

	return {
		ok: true,
		branchName: branch.value,
		folderName: folder.value,
	};
}

/** i18next key for a {@link ResolveWorktreeCheckoutError}. */
export function resolveWorktreeCheckoutErrorI18nKey(
	error: ResolveWorktreeCheckoutError,
): string {
	if (error.field === "branch") {
		return `branchName.error.${error.reason}`;
	}
	if (error.reason === "worktree_combined_name_too_long") {
		return "worktreeCheckout.error.worktree_combined_name_too_long";
	}
	return `folderName.error.${error.reason}`;
}
