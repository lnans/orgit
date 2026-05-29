import { useLogStore } from "@client/features/logs/store";
import { useTranslation } from "react-i18next";
import { LogPanelToggleView } from "./log-panel-toggle-view";

export function LogPanelToggle() {
	const { t } = useTranslation();
	const open = useLogStore((state) => state.open);
	const toggle = useLogStore((state) => state.toggle);

	return (
		<LogPanelToggleView
			open={open}
			label={t("logs")}
			ariaLabel={t("logsToggle")}
			onToggle={toggle}
		/>
	);
}
