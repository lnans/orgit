import React from "react";

export function useResizeWidth<T extends HTMLElement>(minWidth: number, maxWidth: number) {
	const ref = React.useRef<T>(null);
	const dragState = React.useRef({ startX: 0, startWidth: 0 });

	const handlePointerMove = React.useCallback(
		(e: PointerEvent) => {
			const { startX, startWidth } = dragState.current;
			const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + (e.clientX - startX)));
			if (ref.current) ref.current.style.width = `${newWidth}px`;
		},
		[minWidth, maxWidth],
	);

	const handlePointerUp = React.useCallback(() => {
		document.removeEventListener("pointermove", handlePointerMove);
		document.removeEventListener("pointerup", handlePointerUp);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, [handlePointerMove]);

	const handlePointerDown = React.useCallback(
		(e: React.PointerEvent<HTMLSpanElement>) => {
			dragState.current = {
				startX: e.clientX,
				startWidth: ref.current?.offsetWidth ?? 0,
			};
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
			document.addEventListener("pointermove", handlePointerMove);
			document.addEventListener("pointerup", handlePointerUp);
		},
		[handlePointerMove, handlePointerUp],
	);

	return {
		ref,
		handlePointerDown,
	};
}
