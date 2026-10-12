import { useResizeWidth } from "@renderer/hooks/useResizeWidth";
import type { IconProps } from "@tabler/icons-react";
import type React from "react";
import { Text } from "./Text";

const DEFAULT_WIDTH = 300;
const MAX_WIDTH = 800;

export function Navbar({ children }: { children?: React.ReactNode }) {
	const { ref, handlePointerDown } = useResizeWidth<HTMLDivElement>(
		DEFAULT_WIDTH,
		MAX_WIDTH,
	);

	return (
		<div
			className="flex flex-col relative pt-7 shrink-0"
			ref={ref}
			style={{ width: DEFAULT_WIDTH }}
		>
			{children}

			{/* Draggable border right */}
			<span
				className="absolute top-0 right-0 h-full w-1 border-r border-r-border hover:cursor-col-resize transition-colors"
				onPointerDown={handlePointerDown}
			/>
		</div>
	);
}

type NavBarTitleProps = {
	title: string;
	children?: React.ReactNode;
};

export function NavBarTitle({ title, children }: NavBarTitleProps) {
	return (
		<div className="inline-flex items-center px-2.5 py-1">
			<Text>{title}</Text>
			<div className="inline-flex items-center ms-auto gap-0.5">{children}</div>
		</div>
	);
}

type NavBarItemProps = {
	title: string;
	icon: React.ForwardRefExoticComponent<
		IconProps & React.RefAttributes<SVGSVGElement>
	>;
	children?: React.ReactNode;
};

export function NavBarItem({ title, icon, children }: NavBarItemProps) {
	const Icon = icon;
	return (
		<div className="inline-flex items-center ms-3 me-3 py-0.5">
			<Icon height={14} />
			<Text>{title}</Text>
			<div className="inline-flex items-center ms-auto gap-0.5">{children}</div>
		</div>
	);
}

type NavBarSubItemProps = {
	title: string;
	children?: React.ReactNode;
};

export function NavBarSubItem({ title, children }: NavBarSubItemProps) {
	return (
		<div className="group inline-flex items-center ms-4.5 me-2.5 ps-4.5 rounded-md hover:bg-sidebar-accent/60">
			<Text className="overflow-hidden whitespace-nowrap text-ellipsis select-none py-0.75">
				{title}
			</Text>
			<div className="hidden group-hover:inline-flex items-center ms-auto gap-0.5 *:size-5">
				{children}
			</div>
		</div>
	);
}
