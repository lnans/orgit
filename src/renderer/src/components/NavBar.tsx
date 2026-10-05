import { useResizeWidth } from "@renderer/hooks/useResizeWidth";
import { IconFolderPlus } from "@tabler/icons-react";
import type React from "react";
import { Button } from "./Button";
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
	onAdd?: () => void;
};

export function NavBarTitle({ title, onAdd }: NavBarTitleProps) {
	return (
		<div className="inline-flex items-center justify-between px-2.5 py-1">
			<Text>{title}</Text>
			<Button variant="ghost" size="icon-xs" onClick={onAdd}>
				<IconFolderPlus />
			</Button>
		</div>
	);
}
