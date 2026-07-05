import { IconTerminal2, IconTrash } from "@tabler/icons-react";
import { useCallback } from "react";
import { ButtonIcon } from "@/client/components/ui/ButtonIcon";
import { NavbarSubItem } from "@/client/components/ui/Navbar";

type RepositoryWorktreeItemProps = {
	name: string;
	path: string;
	onNewSession?: (path: string) => void;
	onDelete?: (path: string) => void;
};

export function RepositoryWorktreeItem({
	name,
	path,
	onNewSession,
	onDelete,
}: RepositoryWorktreeItemProps) {
	const handleNewSession = useCallback(() => onNewSession?.(path), [path, onNewSession]);
	const handleDelete = useCallback(() => onDelete?.(path), [path, onDelete]);

	return (
		<NavbarSubItem label={name}>
			<ButtonIcon icon={IconTrash} onClick={handleDelete} variant="ghost" />
			<ButtonIcon icon={IconTerminal2} onClick={handleNewSession} variant="ghost" />
		</NavbarSubItem>
	);
}
