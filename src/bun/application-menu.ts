import type { ApplicationMenuItemConfig } from "electrobun/bun";
import { ApplicationMenu } from "electrobun/bun";

const APPLICATION_MENU: ApplicationMenuItemConfig[] = [
	{
		submenu: [{ role: "quit" }],
	},
	{
		label: "Edit",
		submenu: [
			{ role: "undo" },
			{ role: "redo" },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			{ role: "selectAll" },
		],
	},
];

export function setupApplicationMenu(): void {
	ApplicationMenu.setApplicationMenu(APPLICATION_MENU);
}
