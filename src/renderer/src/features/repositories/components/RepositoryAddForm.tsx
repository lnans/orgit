import { Button } from "@renderer/components/Button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@renderer/components/overlays/Dialog";
import { IconFolderPlus } from "@tabler/icons-react";

export function RepositoryAddForm() {
	return (
		<Dialog disablePointerDismissal>
			<form>
				<DialogTrigger
					render={
						<Button variant="ghost" size="icon-xs">
							<IconFolderPlus />
						</Button>
					}
				/>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>New repositoy</DialogTitle>
					</DialogHeader>
					<div>content</div>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
