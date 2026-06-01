import { Header } from "@client/components/layout/header";
import { ScrollArea } from "@client/components/ui/scroll-area";
import {
	Sidebar,
	SidebarContent,
	SidebarProvider,
} from "@client/components/ui/sidebar";
import { TooltipProvider } from "@client/components/ui/tooltip";
import { LogPanel } from "@client/features/logs";
import { useLogPanelShortcut } from "@client/features/logs/hooks/use-log-panel-shortcut";
import { useLogStore } from "@client/features/logs/store";
import {
	CreateRepositoryDialogHost,
	RepositoryMenu,
} from "@client/features/repositories";
import { TerminalPanel } from "@client/features/terminal";
import {
	CreateWorktreeDialogHost,
	WorktreeMenu,
} from "@client/features/worktrees";
import { useWindowFocusOnMount } from "@client/hooks/use-window-focus";
import { i18next } from "@client/lib/i18n";
import { I18nextProvider } from "react-i18next";

function App() {
	const logPanelOpen = useLogStore((state) => state.open);

	useLogPanelShortcut();
	useWindowFocusOnMount();

	return (
		<div className="flex h-dvh flex-col overflow-hidden dark:bg-orgit-background">
			<CreateRepositoryDialogHost />
			<CreateWorktreeDialogHost />
			<SidebarProvider className="flex min-h-0 flex-1 flex-col">
				<Header />

				<div className="flex flex-1 flex-row overflow-hidden">
					<Sidebar className="border-none">
						<SidebarContent className="pb-6 pt-10 dark:bg-orgit-background">
							<ScrollArea className="h-full">
								<RepositoryMenu />
								<WorktreeMenu />
							</ScrollArea>
						</SidebarContent>
					</Sidebar>

					<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
						<main className="flex min-h-0 flex-1 flex-col overflow-hidden m-2 mt-0 rounded-md dark:bg-orgit-background">
							<TerminalPanel />
						</main>

						{logPanelOpen ? <LogPanel /> : null}
					</div>
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
