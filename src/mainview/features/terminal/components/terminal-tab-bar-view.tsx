import { Button } from "@client/components/ui/button";
import { cn } from "@client/lib/utils";
import type { TerminalTab } from "@shared/terminal-tab";
import { XIcon } from "lucide-react";

export type TerminalTabBarViewProps = {
	tabs: TerminalTab[];
	activeTabId: string | undefined;
	closeTabLabel: (label: string) => string;
	onSelectTab: (tabId: string) => void;
	onCloseTab: (tabId: string) => void;
};

export function TerminalTabBarView({
	tabs,
	activeTabId,
	closeTabLabel,
	onSelectTab,
	onCloseTab,
}: TerminalTabBarViewProps) {
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
							onClick={() => onSelectTab(tab.id)}
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
							onClick={() => onCloseTab(tab.id)}
						>
							<XIcon className="size-3" />
							<span className="sr-only">{closeTabLabel(tab.label)}</span>
						</Button>
					</div>
				);
			})}
		</div>
	);
}
