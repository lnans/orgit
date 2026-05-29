import { useTerminalSession } from "@client/features/terminal/hooks/use-terminal-session";
import { cn } from "@client/lib/utils";
import { useRef } from "react";

type TerminalSessionViewProps = {
	sessionId: string;
	cwd: string;
	active: boolean;
};

export function TerminalSessionView({
	sessionId,
	cwd,
	active,
}: TerminalSessionViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	useTerminalSession({ sessionId, cwd, active, containerRef });

	return (
		<div
			className={cn(
				"absolute inset-0 min-h-0 overflow-hidden px-2.5 py-1.5",
				!active && "invisible pointer-events-none",
			)}
			aria-hidden={!active}
		>
			<div
				ref={containerRef}
				className={cn(
					"orgit-terminal h-full min-h-0 w-full",
					"electrobun-webkit-app-region-no-drag",
				)}
			/>
		</div>
	);
}
