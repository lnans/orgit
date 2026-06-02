import { SidebarCardContextMenu } from "@client/components/sidebar-card-context-menu";
import { ContextMenuItem } from "@client/components/ui/context-menu";
import { Download } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useGitPull } from "../hooks/use-git-pull";
import { useGitPullStore } from "../store-git-pull";

export type RepositoryCardContextMenuProps = {
	repositoryPath: string;
	onSelect: () => void;
	children: ReactNode;
};

export function RepositoryCardContextMenu({
	repositoryPath,
	onSelect,
	children,
}: RepositoryCardContextMenuProps) {
	const { t } = useTranslation();
	const isLoading = useGitPullStore((state) => state.isLoading(repositoryPath));
	const gitPull = useGitPull();

	return (
		<SidebarCardContextMenu
			loading={isLoading}
			onSelect={onSelect}
			menu={
				<ContextMenuItem
					onClick={() => gitPull(repositoryPath, repositoryPath)}
				>
					<Download />
					{t("gitPull")}
				</ContextMenuItem>
			}
		>
			{children}
		</SidebarCardContextMenu>
	);
}
