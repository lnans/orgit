import type { IconProps } from "@tabler/icons-react";
import type React from "react";
import { useResizeWidth } from "../hooks/use-resize-width";

const DEFAULT_WIDTH = 300;
const MAX_WIDTH = 800;

export function Navbar({ children }: { children?: React.ReactNode }) {
	const { ref, handlePointerDown } = useResizeWidth<HTMLDivElement>(DEFAULT_WIDTH, MAX_WIDTH);

	return (
		<div
			className="flex flex-col relative pt-7 bg-nav bg-opacity-20 shrink-0"
			ref={ref}
			style={{ width: DEFAULT_WIDTH }}
		>
			{children}

			{/* Draggable border right */}
			<span
				className="absolute top-0 right-0 h-full w-1 border-r border-r-neutral-800 hover:cursor-col-resize hover:border-r-neutral-700 transition-colors"
				onPointerDown={handlePointerDown}
			/>
		</div>
	);
}

export function NavbarTitle({ label, children }: { label: string; children?: React.ReactNode }) {
	return (
		<div className="inline-flex items-center gap-0.5 h-6 px-2.5">
			<p className="text-2xs text-neutral-500">{label}</p>
			<div className="flex-1" />
			{children}
		</div>
	);
}

export function NavbarItem({
	label,
	description,
	iconLabel,
	iconDescription,
	children,
}: {
	label: string;
	description?: string;
	iconLabel: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
	iconDescription?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
	children?: React.ReactNode;
}) {
	const IconLabel = iconLabel;
	const IconDescription = iconDescription;

	return (
		<div className="inline-flex items-center gap-2 h-5 px-1 ms-1.5 me-2">
			<IconLabel className="text-neutral-400" size={12} />
			<p className="text-2xs text-neutral-400 text-ellipsis whitespace-nowrap overflow-hidden">
				{label}
			</p>
			<div className="flex-1" />
			<div className="inline-flex items-center justify-center gap-0.5">{children}</div>
			<div className="inline-flex items-center justify-center gap-1 text-neutral-500">
				{IconDescription && <IconDescription size={12} />}
				<p className="text-2xs">{description}</p>
			</div>
		</div>
	);
}

export function NavbarSubItem({ label, children }: { label: string; children?: React.ReactNode }) {
	return (
		<div className="group inline-flex items-center mx-2.5 h-5 rounded-md text-neutral-400 hover:bg-neutral-500/10 hover:text-neutral-300">
			<p className="ps-5 text-2xs text-ellipsis whitespace-nowrap overflow-hidden">{label}</p>
			<div className="flex-1" />
			<div className="invisible inline-flex items-center justify-center gap-0.5 group-hover:visible">
				{children}
			</div>
		</div>
	);
}

export function NavbarItemEmpty({ label }: { label: string }) {
	return (
		<div className="inline-flex items-center h-5">
			<p className="ps-7.5 text-2xs text-neutral-500">{label}</p>
		</div>
	);
}
