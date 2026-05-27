import type { TerminalTab } from "@shared/terminal-tab";

export function resolveNextActiveTabId(
	worktreeTabs: TerminalTab[],
	closingTabId: string,
	currentActiveId: string | undefined,
): string | undefined {
	if (currentActiveId !== closingTabId) {
		return currentActiveId;
	}

	const index = worktreeTabs.findIndex((tab) => tab.id === closingTabId);
	const nextTab = worktreeTabs[index + 1] ?? worktreeTabs[index - 1];
	if (!nextTab || nextTab.id === closingTabId) {
		return undefined;
	}
	return nextTab.id;
}
