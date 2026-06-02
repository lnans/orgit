import { mainProcess } from "@client/rpc";
import { useEffect } from "react";

function isWindowFocused(): boolean {
	return document.visibilityState === "visible" && document.hasFocus();
}

/** Notifies the main process when the webview window gains or loses focus. */
export function useWorktreeStatusWatchFocus() {
	useEffect(() => {
		let lastFocused: boolean | undefined;

		const report = () => {
			const focused = isWindowFocused();
			if (focused === lastFocused) {
				return;
			}

			lastFocused = focused;
			mainProcess.setWindowFocused(focused);
		};

		report();

		window.addEventListener("focus", report);
		window.addEventListener("blur", report);
		document.addEventListener("visibilitychange", report);

		return () => {
			window.removeEventListener("focus", report);
			window.removeEventListener("blur", report);
			document.removeEventListener("visibilitychange", report);
		};
	}, []);
}
