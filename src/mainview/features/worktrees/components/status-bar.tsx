import { useTerminalCount } from "@client/features/terminal/store";
import { useAppStore, useSelectedRepository } from "@client/store";
import { getSelectedWorktreePath } from "@shared/selection";
import { FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

function StatusBar() {
	const { t } = useTranslation();
	const currentRepository = useSelectedRepository();
	const selectedWorktreePath = useAppStore((state) =>
		getSelectedWorktreePath(state),
	);

	const terminalCount = useTerminalCount(selectedWorktreePath);

	const currentWorktree = currentRepository?.worktrees.find(
		(worktree) => worktree.path === selectedWorktreePath,
	);

	const repositoryName = currentRepository?.name;
	const worktreeName = currentWorktree?.name ?? t("selectWorktreeFirst");

	return (
		<div className="inline-flex items-center gap-2 px-2 h-6 w-dvw max-w-150 mx-auto rounded-md cursor-pointer transition-colors border dark:bg-orgit-surface-light dark:border-orgit-border-light dark:hover:bg-orgit-hover-light">
			<FolderOpen className="dark:text-muted-foreground" size={11} />
			{repositoryName && (
				<span className="dark:text-muted-foreground text-xs font-light italic">
					({repositoryName})
				</span>
			)}
			<span className="dark:text-muted-foreground text-xs font-semibold">
				{worktreeName}
			</span>
			<span className="w-px p-0 m-0 h-4 ms-auto dark:bg-neutral-700" />
			<span className="w-2.5 h-2.5 dark:bg-neutral-300 rounded-2xl" />
			<span className="dark:text-muted-foreground text-xs">
				{terminalCount}
			</span>
		</div>
	);
}

export { StatusBar };
