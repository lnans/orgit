import { TerminalEmptyState } from "@client/features/terminal/components/terminal-empty-state";
import { TerminalSessionView } from "@client/features/terminal/components/terminal-session";
import { TerminalTabBar } from "@client/features/terminal/components/terminal-tab-bar";
import {
	SEAM_HEIGHT_PX,
	useActiveTabSeam,
} from "@client/features/terminal/hooks/use-active-tab-seam";
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
import { useCallback, useState } from "react";

export function TerminalPanel() {
	const selectedWorktreePath = useSelectedWorktreePath();
	const worktreeTabs = useWorktreeTerminalTabs(selectedWorktreePath);
	const activeTabId = useActiveTerminalTabId(selectedWorktreePath);
	const allTabs = useAllTerminalTabs();
	const terminalBackground =
		useTerminalConfig().theme.background ??
		DEFAULT_TERMINAL_THEME.background ??
		"#1f2227";

	const [chromeEl, setChromeEl] = useState<HTMLElement | null>(null);
	const [activeTabEl, setActiveTabEl] = useState<HTMLDivElement | null>(null);
	const [tabBarScrollEl, setTabBarScrollEl] = useState<HTMLDivElement | null>(
		null,
	);
	const onChromeRef = useCallback((node: HTMLElement | null) => {
		setChromeEl(node);
	}, []);
	const onActiveTabRef = useCallback((node: HTMLDivElement | null) => {
		setActiveTabEl(node);
	}, []);
	const onTabBarScrollRef = useCallback((node: HTMLDivElement | null) => {
		setTabBarScrollEl(node);
	}, []);

	useTerminalNewTabShortcut(selectedWorktreePath);

	const hasWorktreeTabs = worktreeTabs.length > 0;
	const showWorktreeChrome = Boolean(selectedWorktreePath);
	const showEmptyState = !showWorktreeChrome || !hasWorktreeTabs;
	const showTabSeam = showWorktreeChrome && hasWorktreeTabs;
	const activeTabIsFirst =
		worktreeTabs.length > 0 && worktreeTabs[0]?.id === activeTabId;
	const seam = useActiveTabSeam(
		showTabSeam ? activeTabEl : null,
		showTabSeam ? chromeEl : null,
		showTabSeam ? tabBarScrollEl : null,
	);

	return (
		<section
			ref={onChromeRef}
			className={cn(
				"terminal-panel relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-md",
				!showWorktreeChrome && "bg-main-surface",
				showEmptyState && "border dark:border-orgit-border",
			)}
			style={
				showWorktreeChrome
					? ({ "--terminal-bg": terminalBackground } as React.CSSProperties)
					: undefined
			}
			aria-label="Terminal"
		>
			{selectedWorktreePath ? (
				<TerminalTabBar
					worktreePath={selectedWorktreePath}
					activeTabRef={onActiveTabRef}
					tabBarScrollRef={onTabBarScrollRef}
				/>
			) : null}

			{seam ? (
				<div
					className="pointer-events-none absolute z-30 bg-[var(--terminal-bg)]"
					style={{
						left: seam.left,
						top: seam.top,
						width: seam.width,
						height: SEAM_HEIGHT_PX,
					}}
					aria-hidden
				/>
			) : null}

			<div
				className={cn(
					"relative z-0 flex min-h-0 flex-1 flex-col",
					showWorktreeChrome &&
						hasWorktreeTabs &&
						"overflow-hidden rounded-md border dark:border-orgit-border",
					showWorktreeChrome &&
						hasWorktreeTabs &&
						activeTabIsFirst &&
						"rounded-tl-none",
				)}
				style={
					showWorktreeChrome && hasWorktreeTabs
						? { backgroundColor: terminalBackground }
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
						frameless={showWorktreeChrome && hasWorktreeTabs}
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
