import { TerminalEmptyState } from "@client/features/terminal/components/terminal-empty-state";
import { TerminalSessionView } from "@client/features/terminal/components/terminal-session";
import {
	TerminalTabBar,
	TerminalTabsPlaceholder,
} from "@client/features/terminal/components/terminal-tab-bar";
import { useTerminalNewTabShortcut } from "@client/features/terminal/hooks/use-terminal-new-tab-shortcut";
import {
	useActiveTerminalTabId,
	useAllTerminalTabs,
	useTerminalStore,
	useWorktreeTerminalTabs,
} from "@client/features/terminal/store";
import { cn } from "@client/lib/utils";
import { useSelectedWorktreePath } from "@client/store";
import { useTerminalConfig } from "@client/store/config-store";
import { DEFAULT_TERMINAL_THEME } from "@shared/config";
import "@xterm/xterm/css/xterm.css";
import { useEffect } from "react";

export function TerminalPanel() {
	const selectedWorktreePath = useSelectedWorktreePath();
	const worktreeTabs = useWorktreeTerminalTabs(selectedWorktreePath);
	const allTabs = useAllTerminalTabs();
	const activeTabId = useActiveTerminalTabId(selectedWorktreePath);
	const createTab = useTerminalStore((state) => state.createTab);
	const terminalBackground =
		useTerminalConfig().theme.background ??
		DEFAULT_TERMINAL_THEME.background ??
		"#282a36";

	useTerminalNewTabShortcut(selectedWorktreePath);

	useEffect(() => {
		if (!selectedWorktreePath) {
			return;
		}

		const hasTabs = useTerminalStore
			.getState()
			.tabs.some((tab) => tab.worktreePath === selectedWorktreePath);
		if (!hasTabs) {
			createTab(selectedWorktreePath);
		}
	}, [selectedWorktreePath, createTab]);

	const hasWorktree = Boolean(selectedWorktreePath);
	const hasWorktreeTabs = worktreeTabs.length > 0;

	return (
		<section
			className={cn(
				"terminal-panel relative flex min-h-0 flex-1 flex-col overflow-hidden",
				!hasWorktree && "bg-main-surface",
			)}
			style={
				hasWorktree && hasWorktreeTabs
					? ({
							"--terminal-bg": terminalBackground,
							backgroundColor: terminalBackground,
						} as React.CSSProperties)
					: undefined
			}
			aria-label="Terminal"
		>
			{!hasWorktree ? (
				<TerminalEmptyState />
			) : (
				<>
					<TerminalTabBar worktreePath={selectedWorktreePath} />
					<div
						className={cn(
							"relative min-h-0 flex-1",
							!hasWorktreeTabs && "bg-main-surface",
						)}
						style={
							hasWorktreeTabs
								? ({
										"--terminal-bg": terminalBackground,
										backgroundColor: terminalBackground,
									} as React.CSSProperties)
								: undefined
						}
					>
						{!hasWorktreeTabs ? <TerminalTabsPlaceholder /> : null}
						{allTabs.map((tab) => {
							const visible = tab.worktreePath === selectedWorktreePath;
							const active = visible && tab.id === activeTabId;
							return (
								<TerminalSessionView
									key={tab.id}
									sessionId={tab.id}
									cwd={tab.worktreePath}
									visible={visible}
									active={active}
								/>
							);
						})}
					</div>
				</>
			)}
		</section>
	);
}
