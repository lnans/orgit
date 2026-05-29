import { Button } from "@client/components/ui/button";
import { ScrollArea } from "@client/components/ui/scroll-area";
import { Text } from "@client/components/ui/text";
import { getLogLineClassName } from "@client/features/logs/lib/log-line";
import { useLogStore } from "@client/features/logs/store";
import { cn } from "@client/lib/utils";
import { XIcon } from "lucide-react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

export function LogPanel() {
	const { t } = useTranslation();
	const content = useLogStore((state) => state.content);
	const setOpen = useLogStore((state) => state.setOpen);
	const bottomRef = useRef<HTMLDivElement>(null);
	const lines = useMemo(
		() => (content.length > 0 ? content.split("\n") : []),
		[content],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll when log content updates
	useLayoutEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [content]);

	return (
		<section
			className="flex h-48 shrink-0 flex-col dark:bg-orgit-surface m-2 mt-0 rounded-md border dark:border-orgit-border"
			aria-label={t("logPanel")}
		>
			<div className="flex h-8 shrink-0 items-center justify-between gap-2 border-b dark:border-orgit-border ps-3 pe-2">
				<Text className="text-xs font-medium">{t("logPanel")}</Text>
				<Button
					className="p-1 cursor-pointer dark:text-slate-400 dark:hover:bg-orgit-hover"
					variant="ghost"
					size="icon-xs"
					onClick={() => setOpen(false)}
				>
					<XIcon className="size-3" />
				</Button>
			</div>
			<ScrollArea scrollbars="both" className="min-h-0 min-w-0 flex-1">
				<div className="block w-max min-w-full px-3 py-2 font-mono text-[11px] leading-relaxed">
					{lines.length > 0 ? (
						lines.map((line, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: log file is rendered as a full snapshot
								key={`${index}-${line}`}
								className={cn("whitespace-pre", getLogLineClassName(line))}
							>
								{line}
							</div>
						))
					) : (
						<div className="whitespace-pre text-muted-foreground">
							{t("logPanelEmpty")}
						</div>
					)}
					<div ref={bottomRef} />
				</div>
			</ScrollArea>
		</section>
	);
}
