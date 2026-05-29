import { Button } from "@client/components/ui/button";
import { Text } from "@client/components/ui/text";
import { cn } from "@client/lib/utils";
import type { TerminalTab } from "@shared/terminal-tab";
import { XIcon } from "lucide-react";
import type { Ref } from "react";

export type TerminalTabBarViewProps = {
	tabs: TerminalTab[];
	activeTabId: string | undefined;
	closeTabLabel: (label: string) => string;
	onSelectTab: (tabId: string) => void;
	onCloseTab: (tabId: string) => void;
	activeTabRef?: Ref<HTMLDivElement>;
	tabBarScrollRef?: Ref<HTMLDivElement>;
};

const activeTabClasses =
	"relative z-10 h-9 border border-b-0 rounded-t-md bg-[var(--terminal-bg)] text-foreground dark:border-orgit-border";

export function TerminalTabBarView({
	tabs,
	activeTabId,
	closeTabLabel,
	onSelectTab,
	onCloseTab,
	activeTabRef,
	tabBarScrollRef,
}: TerminalTabBarViewProps) {
	return (
		<div
			className={cn(
				"relative z-10 flex h-9 shrink-0 items-end",
				tabs.length === 0 && "dark:bg-orgit-surface",
			)}
		>
			<div
				ref={tabBarScrollRef}
				className="flex min-w-0 shrink items-end overflow-x-auto"
			>
				{tabs.map((tab) => {
					const isActive = tab.id === activeTabId;
					return (
						// biome-ignore lint/a11y/useKeyWithClickEvents: interactive tab on desktop
						// biome-ignore lint/a11y/noStaticElementInteractions: interactive tab on desktop
						<div
							key={tab.id}
							ref={isActive ? activeTabRef : undefined}
							className={cn(
								"group relative flex min-w-0 max-w-48 shrink-0 cursor-pointer items-center gap-0.5 rounded-t-md px-1",
								isActive ? activeTabClasses : "h-9 text-muted-foreground",
							)}
							onClick={() => onSelectTab(tab.id)}
						>
							<Text className="p-0 min-w-0 flex-1 justify-start px-2 text-xs font-normal">
								<span className="truncate">{tab.label}</span>
							</Text>
							<Button
								variant="ghost"
								size="icon-xs"
								className={cn(
									"p-1 cursor-pointer dark:text-slate-400 dark:hover:bg-orgit-hover",
									isActive
										? "opacity-100"
										: "opacity-0 group-hover:opacity-100",
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
			{tabs.length > 0 ? (
				<div
					className="h-9 min-w-0 flex-1 dark:bg-orgit-background"
					aria-hidden
				/>
			) : null}
		</div>
	);
}
