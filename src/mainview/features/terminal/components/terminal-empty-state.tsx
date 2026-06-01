import { Kbd, KbdGroup } from "@client/components/ui/kbd";
import { OrgitIcon } from "@client/features/terminal/components/orgit-icon";
import { useTranslation } from "react-i18next";

function TerminalEmptyState() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col min-h-0 flex-1 gap-8 items-center justify-center dark:bg-orgit-surface">
			<OrgitIcon className="size-32 text-sidebar-ring/70" />
			<div className="flex flex-col gap-2 w-full max-w-2/12">
				<TerminalEmptyStateHelper
					message={t("openTerminal")}
					keys={["⌘", "T"]}
				/>
				<TerminalEmptyStateHelper message={t("toggleMenu")} keys={["⌘", "B"]} />
				<TerminalEmptyStateHelper message={t("toggleLogs")} keys={["⌘", "J"]} />
			</div>
		</div>
	);
}

function TerminalEmptyStateHelper({
	message,
	keys,
}: {
	message: string;
	keys: string[];
}) {
	return (
		<div className="inline-flex items-center justify-between">
			<span className="text-sm text-gray-500">{message}</span>
			<KbdGroup>
				{keys.map((key) => (
					<Kbd key={key}>{key}</Kbd>
				))}
			</KbdGroup>
		</div>
	);
}

export { TerminalEmptyState };
