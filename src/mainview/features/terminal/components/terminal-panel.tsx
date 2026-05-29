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
	const showWorktreeChrome = Boolean(selectedWorktreePath);
	const showEmptyState = !showWorktreeChrome || !hasWorktreeTabs;
	const terminalSurfaceStyle = showWorktreeChrome
		? ({
				"--terminal-bg": terminalBackground,
				backgroundColor: terminalBackground,
			} as React.CSSProperties)
		: undefined;

	return (
		<section
			className={cn(
				"terminal-panel relative flex min-h-0 flex-1 flex-col overflow-hidden",
				!showWorktreeChrome && "bg-main-surface",
			)}
			aria-label="Terminal"
		>
			{selectedWorktreePath ? (
				<TerminalTabBar worktreePath={selectedWorktreePath} />
			) : null}

			<div
				className={cn(
					"relative flex min-h-0 flex-1 flex-col",
					showEmptyState && !showWorktreeChrome && "bg-main-surface",
					showEmptyState && showWorktreeChrome && "bg-main-surface",
				)}
				style={
					showWorktreeChrome && hasWorktreeTabs
						? terminalSurfaceStyle
						: undefined
				}
			>
				{showEmptyState ? <TerminalEmptyState /> : null}

				{/* Keep all sessions mounted when switching repos/worktrees (scrollback + PTY). */}
				{allTabs.map((tab) => (
					<TerminalSessionView
						key={tab.id}
						sessionId={tab.id}
						cwd={tab.worktreePath}
						active={
							showWorktreeChrome &&
							tab.worktreePath === selectedWorktreePath &&
							tab.id === activeTabId
						}
					/>
				))}
			</div>
		</section>
	);
}
