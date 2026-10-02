import { useResizeWidth } from "@renderer/hooks/useResizeWidth";
import type React from "react";

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
