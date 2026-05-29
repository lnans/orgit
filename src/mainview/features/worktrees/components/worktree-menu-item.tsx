import { Card, CardContent } from "@client/components/ui/card";
import { SidebarMenuItem } from "@client/components/ui/sidebar";
import { Text } from "@client/components/ui/text";
import { cn } from "@client/lib/utils";
import type { Worktree } from "@shared/types";
import { cva } from "class-variance-authority";
import { FileBracesIcon, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hasWorktreeChanges } from "../lib/worktree-changes";
import { GitStat } from "./git-stat";

const worktreeMenuItemVariants = cva(
	"pt-0.5 pb-1 mx-2 gap-0 rounded-sm cursor-pointer hover:bg-secondary transition-all",
	{
		variants: {
			isSelected: {
				true: "bg-secondary",
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
						<Text className="font-medium text-[10px]">{worktree.name}</Text>

						{hasChanges ? (
							<div className="inline-flex items-center gap-1">
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
							<Text className="text-[10px] text-muted-foreground">
								{t("noChanges")}
							</Text>
						)}
					</div>
				</CardContent>
			</Card>
		</SidebarMenuItem>
	);
}
