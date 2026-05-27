import { useLogStore } from "@client/features/logs/store";
import { useEffect } from "react";

const LOG_PANEL_KEYBOARD_SHORTCUT = "j";

export function useLogPanelShortcut() {
	const toggle = useLogStore((state) => state.toggle);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() === LOG_PANEL_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				toggle();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggle]);
}
