import { OrgitIcon } from "@client/features/terminal/components/orgit-icon";

export function TerminalEmptyState() {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center">
			<OrgitIcon className="h-16 w-20 text-sidebar-ring/50" />
		</div>
	);
}
