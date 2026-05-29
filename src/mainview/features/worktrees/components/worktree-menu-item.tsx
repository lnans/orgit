import { Card, CardContent } from "@client/components/ui/card";
import { SidebarMenuItem } from "@client/components/ui/sidebar";
import { Text } from "@client/components/ui/text";
import { cn } from "@client/lib/utils";
import type { Worktree } from "@shared/types";
import { cva } from "class-variance-authority";
import { FileBracesIcon, GitFork, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hasWorktreeChanges } from "../lib/worktree-changes";
import { GitStat } from "./git-stat";

const worktreeMenuItemVariants = cva(
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

export type WorktreeMenuItemProps = {
	worktree: Worktree;
	isSelected: boolean;
	onSelect: () => void;
};

export function WorktreeMenuItem({
	worktree,
	isSelected,
	onSelect,
}: WorktreeMenuItemProps) {
	const { t } = useTranslation();
	const hasChanges = hasWorktreeChanges(worktree);

	return (
		<SidebarMenuItem onClick={onSelect}>
			<Card className={cn(worktreeMenuItemVariants({ isSelected }))}>
				<CardContent className="px-2">
					<div className="flex flex-col w-full flex-1 gap-1">
						<div className="inline-flex items-center gap-1">
							<GitFork size={11} />
							<Text className="font-medium text-[10px]">{worktree.name}</Text>
						</div>

						{hasChanges ? (
							<div className="inline-flex items-center gap-1 ms-4">
								<GitStat
									className="text-green-600"
									number={worktree.linesAdded}
									icon={<Plus size={10} />}
								/>
								<GitStat
									className="text-red-600"
									number={worktree.linesRemoved}
									icon={<Minus size={10} />}
								/>
								<GitStat
									className="text-neutral-400 gap-0.5"
									number={worktree.filesModified}
									icon={<FileBracesIcon size={10} />}
								/>
							</div>
						) : (
							<Text className="text-[10px] text-muted-foreground ms-4">
								{t("noChanges")}
							</Text>
						)}
					</div>
				</CardContent>
			</Card>
		</SidebarMenuItem>
	);
}
