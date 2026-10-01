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
			className="flex flex-col relative pt-7 bg-surface bg-opacity-20 shrink-0"
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
