import { TerminalEmptyState } from "@client/features/terminal/components/terminal-empty-state";
import { WorktreeTerminal } from "@client/features/terminal/components/worktree-terminal";
import { useTerminalStore } from "@client/features/terminal/store";
import { cn } from "@client/lib/utils";
import { useSelectedWorktreePath } from "@client/store";
import { useTerminalConfig } from "@client/store/config-store";
import { DEFAULT_TERMINAL_THEME } from "@shared/config";
import "@xterm/xterm/css/xterm.css";
import { useEffect } from "react";

export function TerminalPanel() {
	const selectedWorktreePath = useSelectedWorktreePath();
	const openedSessionKeys = useTerminalStore(
		(state) => state.openedSessionKeys,
	);
	const openSession = useTerminalStore((state) => state.openSession);
	const terminalBackground =
		useTerminalConfig().theme.background ??
		DEFAULT_TERMINAL_THEME.background ??
		"#282a36";

	useEffect(() => {
		if (selectedWorktreePath) {
			openSession(selectedWorktreePath);
		}
	}, [selectedWorktreePath, openSession]);

	const hasTerminal = Boolean(selectedWorktreePath);

	return (
		<section
			className={cn(
				"terminal-panel relative flex min-h-0 flex-1 flex-col overflow-hidden",
				!hasTerminal && "bg-main-surface",
			)}
			style={
				hasTerminal
					? ({
							"--terminal-bg": terminalBackground,
							backgroundColor: terminalBackground,
						} as React.CSSProperties)
					: undefined
			}
			aria-label="Terminal"
		>
			{selectedWorktreePath ? (
				openedSessionKeys.map((key) => (
					<WorktreeTerminal
						key={key}
						sessionKey={key}
						active={key === selectedWorktreePath}
					/>
				))
			) : (
				<TerminalEmptyState />
			)}
		</section>
	);
}
