import { useLogStore } from "@client/features/logs/store";
import { cn } from "@client/lib/utils";
import { PanelBottom } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LogPanelToggle() {
	const { t } = useTranslation();
	const open = useLogStore((state) => state.open);
	const toggle = useLogStore((state) => state.toggle);

	return (
		<button
			type="button"
			onClick={toggle}
			aria-pressed={open}
			aria-label={t("logsToggle")}
			className={cn(
				"inline-flex h-full shrink-0 cursor-pointer items-center gap-1 border-l border-sidebar-border px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				open &&
					"bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
			)}
		>
			<PanelBottom className="size-3 shrink-0" aria-hidden />
			<span>{t("logs")}</span>
		</button>
	);
}
