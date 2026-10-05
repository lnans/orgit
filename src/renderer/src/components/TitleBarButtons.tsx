import { useToggle } from "@renderer/hooks/useToggle";
import { IPC } from "@renderer/ipcRenderer";
import { cn } from "@renderer/utils/className";
import {
	IconMinus,
	IconPlus,
	type IconProps,
	IconX,
} from "@tabler/icons-react";
import React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./AlertDialog";

export function TitleBarButtons() {
	const [confirmOpened, toggleConfirmOpened, setConfirmOpened] =
		useToggle(false);

	const onQuit = React.useCallback(() => IPC.windowClose(), []);

	return (
		<div className="absolute window-no-drag top-1.75 h-7 px-3 z-999">
			<div className="group flex items-center space-x-2.25">
				<TitleBarButton
					icon={IconX}
					color="bg-traffic-red"
					onClick={toggleConfirmOpened}
				/>
				<TitleBarButton
					icon={IconMinus}
					color="bg-traffic-orange"
					onClick={IPC.windowMinimize}
				/>
				<TitleBarButton
					icon={IconPlus}
					color="bg-traffic-green"
					onClick={IPC.windowMaximize}
				/>
			</div>

			<AlertDialog open={confirmOpened} onOpenChangeComplete={setConfirmOpened}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							account from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={toggleConfirmOpened}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={onQuit}>
							Quit
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function TitleBarButton({
	icon,
	color,
	onClick,
}: {
	icon: React.ForwardRefExoticComponent<
		IconProps & React.RefAttributes<SVGSVGElement>
	>;
	color: string;
	onClick?: () => void;
}) {
	const Icon = icon;
	return (
		<button
			className={cn(
				"flex items-center justify-center w-3.5 h-3.5 rounded-full",
				color,
			)}
			type="button"
			onClick={onClick}
		>
			<Icon
				className="opacity-0 group-hover:opacity-55 text-black"
				stroke={4}
				height={11}
			/>
		</button>
	);
}
