import { useTerminal } from "@client/features/terminal/hooks/use-terminal";
import { cn } from "@client/lib/utils";
import { useTerminalConfig } from "@client/store/config-store";
import { DEFAULT_TERMINAL_THEME } from "@shared/config";
import "@xterm/xterm/css/xterm.css";
import { useRef } from "react";

export function TerminalPanel() {
	const containerRef = useRef<HTMLDivElement>(null);
	const terminalBackground =
		useTerminalConfig().theme.background ??
		DEFAULT_TERMINAL_THEME.background ??
		"#282a36";

	useTerminal({ containerRef });

	return (
		<section
			className="terminal-panel flex min-h-0 flex-1 flex-col overflow-hidden"
			style={
				{
					"--terminal-bg": terminalBackground,
					backgroundColor: terminalBackground,
				} as React.CSSProperties
			}
			aria-label="Terminal"
		>
			<div
				ref={containerRef}
				className={cn(
					"orgit-terminal min-h-0 flex-1 overflow-hidden",
					"electrobun-webkit-app-region-no-drag",
				)}
			/>
		</section>
	);
}
