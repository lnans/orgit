import { Button } from "@client/components/ui/button";
import { Text } from "@client/components/ui/text";
import {
	useActiveTerminalTabId,
	useTerminalStore,
	useWorktreeTerminalTabs,
} from "@client/features/terminal/store";
import { cn } from "@client/lib/utils";
import { XIcon } from "lucide-react";

type TerminalTabBarProps = {
	worktreePath: string;
};

function TerminalTabBar({ worktreePath }: TerminalTabBarProps) {
	const tabs = useWorktreeTerminalTabs(worktreePath);
	const activeTabId = useActiveTerminalTabId(worktreePath);
	const setActiveTab = useTerminalStore((state) => state.setActiveTab);
	const closeTab = useTerminalStore((state) => state.closeTab);

	return (
		<div className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-sidebar-border bg-sidebar">
			{tabs.map((tab) => {
				const isActive = tab.id === activeTabId;
				return (
					<div
						key={tab.id}
						className={cn(
							"group flex min-w-0 max-w-48 shrink-0 items-center gap-0.5 border-r border-sidebar-border px-1",
							isActive
								? "bg-main-surface text-foreground"
								: "text-muted-foreground hover:bg-sidebar-accent",
						)}
					>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-7 min-w-0 flex-1 justify-start px-2 text-xs font-normal"
							onClick={() => setActiveTab(tab.id)}
						>
							<span className="truncate">{tab.label}</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							className={cn(
								"size-6 shrink-0 text-muted-foreground hover:text-foreground",
								isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
							)}
							onClick={() => closeTab(tab.id)}
						>
							<XIcon className="size-3" />
							<span className="sr-only">Close {tab.label}</span>
						</Button>
					</div>
				);
			})}
		</div>
	);
}

function TerminalTabsPlaceholder() {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center px-4">
			<Text className="text-center text-xs text-muted-foreground">
				No terminal open. Press ⌘T to open one.
			</Text>
		</div>
	);
}

export { TerminalTabBar, TerminalTabsPlaceholder };
