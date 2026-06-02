import { SidebarCardContextMenu } from "@client/components/sidebar-card-context-menu";
import {
	ContextMenuItem,
	ContextMenuSeparator,
} from "@client/components/ui/context-menu";
import { useRequestDelete } from "@client/features/delete";
import { Download, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useGitPull } from "../hooks/use-git-pull";
import { useGitPullStore } from "../store-git-pull";

export type RepositoryCardContextMenuProps = {
	repositoryPath: string;
	name: string;
	onSelect: () => void;
	children: ReactNode;
};

export function RepositoryCardContextMenu({
	repositoryPath,
	name,
	onSelect,
	children,
}: RepositoryCardContextMenuProps) {
	const { t } = useTranslation();
	const isLoading = useGitPullStore((state) => state.isLoading(repositoryPath));
	const gitPull = useGitPull();
	const requestDelete = useRequestDelete();

	return (
		<SidebarCardContextMenu
			loading={isLoading}
			onSelect={onSelect}
			menu={
				<>
					<ContextMenuItem
						onClick={() => gitPull(repositoryPath, repositoryPath)}
					>
						<Download />
						{t("gitPull")}
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem
						variant="destructive"
						onClick={() =>
							requestDelete({
								kind: "repository",
								repositoryPath,
								label: name,
							})
						}
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
