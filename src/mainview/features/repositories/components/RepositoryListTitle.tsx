import { NavbarTitle } from "@/client/components/Navbar";
import { RepositoryAddForm } from "./RepositoryAddForm";

type RepositoryListTitleProps = {
	label: string;
};

export function RepositoryListTitle({ label }: RepositoryListTitleProps) {
	return (
		<NavbarTitle label={label}>
			<RepositoryAddForm />
		</NavbarTitle>
	);
}
