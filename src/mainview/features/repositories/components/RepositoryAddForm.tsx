import { IconFolderPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/client/components/Button";
import { ButtonIcon } from "@/client/components/ButtonIcon";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/client/components/Dialog";

export function RepositoryAddForm() {
	const { t } = useTranslation();

	return (
		<Dialog>
			<DialogTrigger render={<ButtonIcon icon={IconFolderPlus} />} />
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("repositories_add")}</DialogTitle>
					<DialogDescription>desc</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button>Clone</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
