import { Button } from "@client/components/ui/button";
import { SidebarGroupLabel } from "@client/components/ui/sidebar";
import { Plus } from "lucide-react";

type WorktreeMenuLabelProps = {
	label: string;
	onAddClick?: () => void;
};

function WorktreeMenuLabel({ label, onAddClick }: WorktreeMenuLabelProps) {
	return (
		<SidebarGroupLabel className="text-[10px] justify-between pe-1.5">
			{label}{" "}
			<Button
				className="p-1 cursor-pointer dark:text-slate-400 dark:hover:bg-orgit-hover"
				variant="ghost"
				size="icon-xs"
				onClick={onAddClick}
			>
				<Plus className="size-3" />
			</Button>
		</SidebarGroupLabel>
	);
}

export { WorktreeMenuLabel };
