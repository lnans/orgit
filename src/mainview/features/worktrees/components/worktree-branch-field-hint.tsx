import {
	formatWorktreeFolderName,
	resolveWorktreeCheckout,
	resolveWorktreeCheckoutErrorI18nKey,
} from "@shared/worktree-checkout";
import { useTranslation } from "react-i18next";

type WorktreeBranchFieldHintProps = {
	value: string;
	repositoryBasename?: string;
};

/** Folder preview or validation error for a branch name input. */
function WorktreeBranchFieldHint({
	value,
	repositoryBasename,
}: WorktreeBranchFieldHintProps) {
	const { t } = useTranslation();
	const result = resolveWorktreeCheckout(value, {
		repositoryBasename,
	});

	if (value.trim().length === 0) {
		return null;
	}

	if (!result.ok) {
		const key = resolveWorktreeCheckoutErrorI18nKey(result.error);
		const interpolation =
			result.error.field === "folder" &&
			result.error.reason === "worktree_combined_name_too_long"
				? {
						repository: repositoryBasename ?? "",
						max: result.error.maxSegmentLength ?? 0,
					}
				: undefined;

		return (
			<p className="text-[10px] text-destructive">{t(key, interpolation)}</p>
		);
	}

	const folderLabel = repositoryBasename
		? formatWorktreeFolderName(repositoryBasename, result.folderName)
		: result.folderName;

	return (
		<p className="text-[10px] text-muted-foreground">
			{t("createWorktree.folderPreview", { folder: folderLabel })}
		</p>
	);
}

export { WorktreeBranchFieldHint };
