import { useCallback } from "react";
import { mainProcess } from "@/client/rpc";

export function AppHeader() {
	const handleDoubleClick = useCallback(() => mainProcess.onDoubleClickTitleBar(), []);

	return (
		<nav
			className="absolute w-dvw h-7 z-10 electrobun-webkit-app-region-drag cursor-default select-none"
			onDoubleClick={handleDoubleClick}
		></nav>
	);
}
