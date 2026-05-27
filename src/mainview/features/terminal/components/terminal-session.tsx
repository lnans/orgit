import { useTerminalSession } from "@client/features/terminal/hooks/use-terminal-session";
import { cn } from "@client/lib/utils";
import { useRef } from "react";

type TerminalSessionViewProps = {
	sessionId: string;
	cwd: string;
	visible: boolean;
	active: boolean;
};

export function TerminalSessionView({
	sessionId,
	cwd,
	visible,
	active,
}: TerminalSessionViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	useTerminalSession({ sessionId, cwd, visible, active, containerRef });

	const shown = visible && active;

	return (
		<div
			ref={containerRef}
			className={cn(
				"orgit-terminal absolute inset-0 min-h-0 overflow-hidden px-2.5",
				"electrobun-webkit-app-region-no-drag",
				!shown && "invisible pointer-events-none",
			)}
			aria-hidden={!shown}
		/>
	);
}
