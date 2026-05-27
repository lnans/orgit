import { useTerminalSession } from "@client/features/terminal/hooks/use-terminal-session";
import { cn } from "@client/lib/utils";
import { useRef } from "react";

type WorktreeTerminalProps = {
	sessionKey: string;
	active: boolean;
};

export function WorktreeTerminal({
	sessionKey,
	active,
}: WorktreeTerminalProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	useTerminalSession({ sessionKey, active, containerRef });

	return (
		<div
			ref={containerRef}
			className={cn(
				"orgit-terminal absolute inset-0 min-h-0 overflow-hidden px-2.5",
				"electrobun-webkit-app-region-no-drag",
				!active && "invisible pointer-events-none",
			)}
			aria-hidden={!active}
		/>
	);
}
