import { cn } from "@client/lib/utils";
import { PanelBottom } from "lucide-react";

export type LogPanelToggleViewProps = {
	open: boolean;
	label: string;
	ariaLabel: string;
	onToggle: () => void;
};

export function LogPanelToggleView({
	open,
	label,
	ariaLabel,
	onToggle,
}: LogPanelToggleViewProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={open}
			aria-label={ariaLabel}
			className={cn(
				"inline-flex h-full shrink-0 cursor-pointer items-center gap-1 border-l border-sidebar-border px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				open &&
					"bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
			)}
		>
			<PanelBottom className="size-3 shrink-0" aria-hidden />
			<span>{label}</span>
		</button>
	);
}
