import { Button } from "@renderer/components/Button";
import { NavBarSubItem } from "@renderer/components/layout/NavBar";
import type { WorktreeDto } from "@shared/types/WorktreeDto";
import { IconTerminal2, IconTrash } from "@tabler/icons-react";

type RepositoryWorktreeItemProps = {
	worktree: WorktreeDto;
};

export function RepositoryWorktreeItem({
	worktree,
}: RepositoryWorktreeItemProps) {
	return (
		<NavBarSubItem title={worktree.branch}>
			<Button variant="ghost" size="icon-xs">
				<IconTrash />
			</Button>
			<Button variant="ghost" size="icon-xs">
				<IconTerminal2 />
			</Button>
		</NavBarSubItem>
	);
}
