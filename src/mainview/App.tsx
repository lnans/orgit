import {
	Sidebar,
	SidebarContent,
	SidebarProvider,
	SidebarTrigger,
} from "@client/components/ui/sidebar";
import { Text } from "@client/components/ui/text";
import { Title } from "@client/components/ui/title";
import { LogPanel } from "@client/features/logs/components/log-panel";
import { useLogPanelShortcut } from "@client/features/logs/hooks/use-log-panel-shortcut";
import { useLogStore } from "@client/features/logs/store";
import { RepositoryMenu } from "@client/features/repositories/components/repository-menu";
import { WorktreeMenu } from "@client/features/worktrees/components/worktree-menu";
import { mainProcess } from "@client/rpc";
import { useAppStore } from "@client/store";
import { FolderOpen } from "lucide-react";
import { I18nextProvider } from "react-i18next";
import { ScrollArea } from "./components/ui/scroll-area";
import { TooltipProvider } from "./components/ui/tooltip";
import { i18next } from "./lib/i18n";

function App() {
	const workspacePath = useAppStore((state) => state.workspacePath);
	const logPanelOpen = useLogStore((state) => state.open);

	useLogPanelShortcut();

	return (
		<div className="flex h-dvh flex-col overflow-hidden">
			<SidebarProvider className="flex min-h-0 flex-1 flex-col">
				{/* Header bar */}
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
						<main className="min-h-0 flex-1 overflow-auto">
							<Title variant="h3">Orgit</Title>
							<Text>Welcome to Orgit, your personal Git client.</Text>
						</main>

						{logPanelOpen ? <LogPanel /> : null}
					</div>
				</div>

				{/* Footer bar */}
				<div className="z-50 inline-flex h-6 shrink-0 items-center gap-1 border-t bg-sidebar px-2">
					<FolderOpen size={10} className="text-sidebar-ring" />
					<Text className="text-[10px]" variant="muted">
						{workspacePath || "-"}
					</Text>
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
