import {
	normalizeFolderName,
	normalizeFolderNameErrorI18nKey,
} from "@shared/folder-name";
import { useTranslation } from "react-i18next";

type FolderNameFieldHintProps = {
	value: string;
	normalizedLabelKey?: string;
};

/** Shows normalized folder name or a validation error under a text field. */
function FolderNameFieldHint({
	value,
	normalizedLabelKey = "folderName.normalized",
}: FolderNameFieldHintProps) {
	const { t } = useTranslation();
	const result = normalizeFolderName(value);

	if (value.trim().length === 0) {
		return null;
	}

	if (!result.ok) {
		return (
			<p className="text-[10px] text-destructive">
				{t(normalizeFolderNameErrorI18nKey(result.error.reason))}
			</p>
		);
	}

	return (
		<p className="text-[10px] text-muted-foreground">
			{t(normalizedLabelKey, { name: result.value })}
		</p>
	);
}

export { FolderNameFieldHint };
