import { IconFolderPlus } from "@tabler/icons-react";
import { useCallback } from "react";
import { ButtonIcon } from "@/client/components/ui/ButtonIcon";
import { NavbarTitle } from "@/client/components/ui/Navbar";

type RepositoryListTitleProps = {
	label: string;
	onNewRepository?: () => void;
};

export function RepositoryListTitle({ label, onNewRepository }: RepositoryListTitleProps) {
	const handleNewRepository = useCallback(() => onNewRepository?.(), [onNewRepository]);

	return (
		<NavbarTitle label={label}>
			<ButtonIcon icon={IconFolderPlus} onClick={handleNewRepository} />
		</NavbarTitle>
	);
}
