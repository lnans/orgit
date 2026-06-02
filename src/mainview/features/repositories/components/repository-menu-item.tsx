import { Card, CardContent } from "@client/components/ui/card";
import { Spinner } from "@client/components/ui/spinner";
import { Text } from "@client/components/ui/text";
import { useGitPullStore } from "@client/features/repositories/store-git-pull";
import { cn } from "@client/lib/utils";
import { cva } from "class-variance-authority";
import { FolderOpen, GitBranch } from "lucide-react";
import { RepositoryCardContextMenu } from "./repository-card-context-menu";

const repositoryMenuItemVariants = cva(
	"py-1 mx-2 me-1.5 gap-0 rounded-sm cursor-pointer dark:bg-transparent ring-0 dark:hover:bg-orgit-hover transition-all",
	{
		variants: {
			isSelected: {
				true: "dark:bg-orgit-hover",
				false: "",
			},
		},
	},
);

export type RepositoryMenuItemProps = {
	repositoryPath: string;
	name: string;
	branch: string;
	isSelected: boolean;
	onSelect: () => void;
};

export function RepositoryMenuItem({
	repositoryPath,
	name,
	branch,
	isSelected,
	onSelect,
}: RepositoryMenuItemProps) {
	const isLoading = useGitPullStore((state) => state.isLoading(repositoryPath));

	return (
		<RepositoryCardContextMenu
			repositoryPath={repositoryPath}
			onSelect={onSelect}
		>
			<Card className={cn(repositoryMenuItemVariants({ isSelected }))}>
				<CardContent className="px-2">
					<div className="inline-flex w-full flex-1 items-center justify-between">
						<div className="inline-flex items-center gap-1">
							{isLoading ? (
								<Spinner className="size-[11px]" />
							) : (
								<FolderOpen size={11} />
							)}
							<Text className="font-medium text-[10px]">{name}</Text>
						</div>
						<div className="inline-flex items-center gap-1">
							<GitBranch size={11} className="text-muted-foreground" />
							<Text variant="muted" className="text-[10px]">
								{branch}
							</Text>
						</div>
					</div>
				</CardContent>
			</Card>
		</RepositoryCardContextMenu>
	);
}
