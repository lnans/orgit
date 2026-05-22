import { Button } from "@client/components/ui/button";
import { SidebarGroupLabel } from "@client/components/ui/sidebar";
import { Plus } from "lucide-react";

type RepositoryMenuLabelProps = {
	label: string;
	onAddClick?: () => void;
};

function RepositoryMenuLabel({ label, onAddClick }: RepositoryMenuLabelProps) {
	return (
		<SidebarGroupLabel className="text-[10px] justify-between pe-0.5">
			{label}{" "}
			<Button
				className="cursor-pointer"
				variant="ghost"
				size="icon-sm"
				onClick={onAddClick}
			>
				<Plus />
			</Button>
		</SidebarGroupLabel>
	);
}

export { RepositoryMenuLabel };
