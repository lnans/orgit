import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
} from "@client/components/ui/context-menu";
import { SidebarMenuItem } from "@client/components/ui/sidebar";
import type { ReactNode } from "react";

export type SidebarCardContextMenuProps = {
	/** When true, the context menu is disabled (e.g. while an action runs). */
	loading?: boolean;
	onSelect: () => void;
	onMenuOpenChange?: (open: boolean) => void;
	menu: ReactNode;
	children: ReactNode;
};

/** Right-click shell for sidebar repository/worktree cards. */
export function SidebarCardContextMenu({
	loading = false,
	onSelect,
	onMenuOpenChange,
	menu,
	children,
}: SidebarCardContextMenuProps) {
	if (loading) {
		return (
			<SidebarMenuItem onClick={onSelect} aria-busy>
				{children}
			</SidebarMenuItem>
		);
	}

	return (
		<ContextMenu onOpenChange={onMenuOpenChange}>
			<ContextMenuTrigger
				render={<SidebarMenuItem onClick={onSelect} className="list-none" />}
			>
				{children}
			</ContextMenuTrigger>
			<ContextMenuContent>{menu}</ContextMenuContent>
		</ContextMenu>
	);
}
