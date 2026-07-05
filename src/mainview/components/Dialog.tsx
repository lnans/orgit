import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { IconX } from "@tabler/icons-react";
import { cn } from "../lib/utils";
import { ButtonIcon } from "./ButtonIcon";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			className={cn(
				"fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className,
			)}
			data-slot="dialog-overlay"
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean;
}) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Popup
				className={cn(
					"fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md bg-nav p-4 text-2xs text-neutral-400 ring-1 ring-neutral-500/20 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					className,
				)}
				data-slot="dialog-content"
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close
						data-slot="dialog-close"
						render={<ButtonIcon className="absolute top-2 right-2" icon={IconX} variant="ghost" />}
					/>
				)}
			</DialogPrimitive.Popup>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-2", className)} data-slot="dialog-header" {...props} />
	);
}

function DialogFooter({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"-m-4 flex flex-col-reverse gap-2 rounded-b-xl bg-muted/50 p-2.5 sm:flex-row sm:justify-end",
				className,
			)}
			data-slot="dialog-footer"
			{...props}
		>
			{children}
		</div>
	);
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			className={cn("text-xs leading-none font-medium", className)}
			data-slot="dialog-title"
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			className={cn("text-2xs text-neutral-400", className)}
			data-slot="dialog-description"
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
