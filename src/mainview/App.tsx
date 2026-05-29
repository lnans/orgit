import { ScrollArea } from "@client/components/ui/scroll-area";
import {
	Sidebar,
	SidebarContent,
	SidebarProvider,
	SidebarTrigger,
} from "@client/components/ui/sidebar";
import { Text } from "@client/components/ui/text";
import { TooltipProvider } from "@client/components/ui/tooltip";
import { LogPanel, LogPanelToggle } from "@client/features/logs";
import { useLogPanelShortcut } from "@client/features/logs/hooks/use-log-panel-shortcut";
import { useLogStore } from "@client/features/logs/store";
import { RepositoryMenu } from "@client/features/repositories";
import { TerminalPanel } from "@client/features/terminal";
import { WorktreeMenu } from "@client/features/worktrees";
import { useWindowFocusOnMount } from "@client/hooks/use-window-focus";
import { i18next } from "@client/lib/i18n";
import { mainProcess } from "@client/rpc";
import { useAppStore } from "@client/store";
import { FolderOpen } from "lucide-react";
import { I18nextProvider } from "react-i18next";

function App() {
	const workspacePath = useAppStore((state) => state.workspacePath);
	const logPanelOpen = useLogStore((state) => state.open);

	useLogPanelShortcut();
	useWindowFocusOnMount();

	return (
		<div className="flex h-dvh flex-col overflow-hidden">
			<SidebarProvider className="flex min-h-0 flex-1 flex-col">
				{/* biome-ignore lint/a11y/noStaticElementInteractions: title bar double-click is a native macOS window management gesture */}
				<div
					onDoubleClick={mainProcess.onDoubleClickTitleBar}
					className="z-50 inline-flex h-10 shrink-0 items-center justify-end border-b bg-sidebar px-2 electrobun-webkit-app-region-drag"
				>
					<SidebarTrigger
						variant="ghost"
						size="icon-lg"
						className="cursor-pointer text-sidebar-ring hover:text-sidebar-ring electrobun-webkit-app-region-no-drag"
					/>
				</div>

				<div className="flex min-h-0 flex-1 flex-row overflow-hidden">
					<Sidebar>
						<SidebarContent className="pb-6 pt-10">
							<ScrollArea className="h-full">
								<RepositoryMenu />
								<WorktreeMenu />
							</ScrollArea>
						</SidebarContent>
					</Sidebar>

					<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
						<main className="flex min-h-0 flex-1 flex-col overflow-hidden">
							<TerminalPanel />
						</main>

						{logPanelOpen ? <LogPanel /> : null}
					</div>
				</div>

				{/* Footer bar */}
				<div className="z-50 flex h-6 shrink-0 items-stretch border-t bg-sidebar">
					<div className="flex min-w-0 flex-1 items-center gap-1 px-2">
						<FolderOpen size={10} className="shrink-0 text-sidebar-ring" />
						<Text className="truncate text-[10px]" variant="muted">
							{workspacePath || "-"}
						</Text>
					</div>
					<LogPanelToggle />
				</div>
			</SidebarProvider>
		</div>
	);
}

function Root() {
	return (
		<I18nextProvider i18n={i18next}>
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</I18nextProvider>
	);
}

export { Root };
