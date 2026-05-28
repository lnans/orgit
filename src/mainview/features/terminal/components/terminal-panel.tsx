import { TerminalEmptyState } from "@client/features/terminal/components/terminal-empty-state";
import { TerminalSessionView } from "@client/features/terminal/components/terminal-session";
import { TerminalTabBar } from "@client/features/terminal/components/terminal-tab-bar";
import { useTerminalNewTabShortcut } from "@client/features/terminal/hooks/use-terminal-new-tab-shortcut";
import {
	useActiveTerminalTabId,
	useAllTerminalTabs,
	useWorktreeTerminalTabs,
} from "@client/features/terminal/store";
import { cn } from "@client/lib/utils";
import { useSelectedWorktreePath } from "@client/store";
import { useTerminalConfig } from "@client/store/config-store";
import { DEFAULT_TERMINAL_THEME } from "@shared/config";
import "@xterm/xterm/css/xterm.css";

export function TerminalPanel() {
	const selectedWorktreePath = useSelectedWorktreePath();
	const worktreeTabs = useWorktreeTerminalTabs(selectedWorktreePath);
	const activeTabId = useActiveTerminalTabId(selectedWorktreePath);
	const allTabs = useAllTerminalTabs();
	const terminalBackground =
		useTerminalConfig().theme.background ??
		DEFAULT_TERMINAL_THEME.background ??
		"#282a36";

	useTerminalNewTabShortcut(selectedWorktreePath);

	const hasWorktreeTabs = worktreeTabs.length > 0;

	if (!selectedWorktreePath) {
		return (
			<section
				className={cn(
					"terminal-panel relative flex min-h-0 flex-1 flex-col overflow-hidden",
					"bg-main-surface",
				)}
				aria-label="Terminal"
			>
				<TerminalEmptyState />
			</section>
		);
	}

	return (
		<section
			className={cn(
				"terminal-panel relative flex min-h-0 flex-1 flex-col overflow-hidden",
			)}
			style={
				hasWorktreeTabs
					? ({
							"--terminal-bg": terminalBackground,
							backgroundColor: terminalBackground,
						} as React.CSSProperties)
					: undefined
			}
			aria-label="Terminal"
		>
			<TerminalTabBar worktreePath={selectedWorktreePath} />
			<div
				className={cn(
					"relative flex min-h-0 flex-1 flex-col",
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
				{!hasWorktreeTabs ? <TerminalEmptyState /> : null}
				{allTabs.map((tab) => (
					<TerminalSessionView
						key={tab.id}
						sessionId={tab.id}
						cwd={tab.worktreePath}
						active={
							tab.worktreePath === selectedWorktreePath &&
							tab.id === activeTabId
						}
					/>
				))}
			</div>
		</section>
	);
}
