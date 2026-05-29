import { useTerminalSession } from "@client/features/terminal/hooks/use-terminal-session";
import { cn } from "@client/lib/utils";
import { useRef } from "react";

type TerminalSessionViewProps = {
	sessionId: string;
	cwd: string;
	active: boolean;
	/** Border and rounding are on the panel frame when tabs are shown. */
	frameless?: boolean;
};

export function TerminalSessionView({
	sessionId,
	cwd,
	active,
	frameless = false,
}: TerminalSessionViewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	useTerminalSession({ sessionId, cwd, active, containerRef });

	return (
		<div
			className={cn(
				"absolute inset-0 min-h-0 overflow-hidden px-2.5 py-1.5",
				!frameless && "rounded-md border dark:border-orgit-border",
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
