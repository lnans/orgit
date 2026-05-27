import { useTerminalStore } from "@client/features/terminal/store";
import { useEffect } from "react";

const NEW_TERMINAL_KEYBOARD_SHORTCUT = "t";

export function useTerminalNewTabShortcut(worktreePath: string | undefined) {
	const createTab = useTerminalStore((state) => state.createTab);

	useEffect(() => {
		if (!worktreePath) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() === NEW_TERMINAL_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				createTab(worktreePath);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [worktreePath, createTab]);
}
