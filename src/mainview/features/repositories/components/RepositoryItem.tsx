import { IconFolderOpen, IconGitBranch, IconGitFork, IconRefresh } from "@tabler/icons-react";
import { useCallback } from "react";
import { ButtonIcon } from "@/client/components/ButtonIcon";
import { NavbarItem } from "@/client/components/Navbar";

type RepositoryItemProps = {
	name: string;
	path: string;
	branch: string;
	onRefresh?: (path: string) => void;
	onNewWorktree?: (path: string) => void;
};

export function RepositoryItem({
	name,
	path,
	branch,
	onRefresh,
	onNewWorktree,
}: RepositoryItemProps) {
	const handleRefresh = useCallback(() => onRefresh?.(path), [path, onRefresh]);
	const handleNewWorktree = useCallback(() => onNewWorktree?.(path), [path, onNewWorktree]);

	return (
		<NavbarItem
			description={branch}
			iconDescription={IconGitBranch}
			iconLabel={IconFolderOpen}
			label={name}
		>
			<ButtonIcon icon={IconRefresh} onClick={handleRefresh} />
			<ButtonIcon icon={IconGitFork} onClick={handleNewWorktree} />
		</NavbarItem>
	);
}
