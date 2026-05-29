import {
	useActiveTerminalTabId,
	useTerminalStore,
	useWorktreeTerminalTabs,
} from "@client/features/terminal/store";
import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { TerminalTabBarView } from "./terminal-tab-bar-view";

type TerminalTabBarProps = {
	worktreePath: string;
	activeTabRef?: Ref<HTMLDivElement>;
	tabBarScrollRef?: Ref<HTMLDivElement>;
};

function TerminalTabBar({
	worktreePath,
	activeTabRef,
	tabBarScrollRef,
}: TerminalTabBarProps) {
	const { t } = useTranslation();
	const tabs = useWorktreeTerminalTabs(worktreePath);
	const activeTabId = useActiveTerminalTabId(worktreePath);
	const setActiveTab = useTerminalStore((state) => state.setActiveTab);
	const closeTab = useTerminalStore((state) => state.closeTab);

	return (
		<TerminalTabBarView
			tabs={tabs}
			activeTabId={activeTabId}
			closeTabLabel={(label) => t("closeTab", { label })}
			onSelectTab={setActiveTab}
			onCloseTab={closeTab}
			activeTabRef={activeTabRef}
			tabBarScrollRef={tabBarScrollRef}
		/>
	);
}

export { TerminalTabBar };
