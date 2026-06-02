import { SidebarCardContextMenu } from "@client/components/sidebar-card-context-menu";
import {
	ContextMenuItem,
	ContextMenuSeparator,
} from "@client/components/ui/context-menu";
import { useRequestDelete } from "@client/features/delete";
import { useGitPull, useGitPullStore } from "@client/features/repositories";
import { useSelectedRepository } from "@client/store";
import { Download, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type WorktreeCardContextMenuProps = {
	worktreePath: string;
	name: string;
	onSelect: () => void;
	children: ReactNode;
};

export function WorktreeCardContextMenu({
	worktreePath,
	name,
	onSelect,
	children,
}: WorktreeCardContextMenuProps) {
	const { t } = useTranslation();
	const isLoading = useGitPullStore((state) => state.isLoading(worktreePath));
	const gitPull = useGitPull();
	const requestDelete = useRequestDelete();
	const selectedRepository = useSelectedRepository();

	return (
		<SidebarCardContextMenu
			loading={isLoading}
			onSelect={onSelect}
			menu={
				<>
					<ContextMenuItem onClick={() => gitPull(worktreePath, worktreePath)}>
						<Download />
						{t("gitPull")}
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem
						variant="destructive"
						disabled={!selectedRepository}
						onClick={() => {
							if (!selectedRepository) {
								return;
							}
							requestDelete({
								kind: "worktree",
								repositoryPath: selectedRepository.path,
								worktreePath,
								label: name,
							});
						}}
					>
						<Trash2 />
						{t("delete")}
					</ContextMenuItem>
				</>
			}
		>
			{children}
		</SidebarCardContextMenu>
	);
}
