import { Button } from "@renderer/components/Button";
import { NavBarItem } from "@renderer/components/layout/NavBar";
import { Text } from "@renderer/components/Text";
import type { RepositoryDto } from "@shared/types/RepositoryDto";
import {
	IconFolderOpen,
	IconGitBranch,
	IconGitFork,
	IconRefresh,
} from "@tabler/icons-react";

type RepositoryItemProps = {
	repository: RepositoryDto;
};

export function RepositoryItem({ repository }: RepositoryItemProps) {
	return (
		<NavBarItem title={repository.name} icon={IconFolderOpen}>
			<Button variant="ghost" size="icon-xs">
				<IconRefresh />
			</Button>
			<Button variant="ghost" size="icon-xs">
				<IconGitFork />
			</Button>
			<div className="inline-flex items-center">
				<IconGitBranch height={14} />
				<Text>{repository.branch}</Text>
			</div>
		</NavBarItem>
	);
}
