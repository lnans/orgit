import { SidebarCardContextMenu } from "@client/components/sidebar-card-context-menu";
import { ContextMenuItem } from "@client/components/ui/context-menu";
import { useGitPull, useGitPullStore } from "@client/features/repositories";
import { Download } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type WorktreeCardContextMenuProps = {
	worktreePath: string;
	onSelect: () => void;
	children: ReactNode;
};

export function WorktreeCardContextMenu({
	worktreePath,
	onSelect,
	children,
}: WorktreeCardContextMenuProps) {
	const { t } = useTranslation();
	const isLoading = useGitPullStore((state) => state.isLoading(worktreePath));
	const gitPull = useGitPull();

	return (
		<SidebarCardContextMenu
			loading={isLoading}
			onSelect={onSelect}
			menu={
				<ContextMenuItem onClick={() => gitPull(worktreePath, worktreePath)}>
					<Download />
					{t("gitPull")}
				</ContextMenuItem>
			}
		>
			{children}
		</SidebarCardContextMenu>
	);
}
