import { useLogStore } from "@client/features/logs/store";
import { StatusBar } from "@client/features/worktrees/components/status-bar";
import { mainProcess } from "@client/rpc";
import { Logs, PanelLeftIcon } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

function Header() {
	const { toggleSidebar } = useSidebar();
	const toggleLogPanel = useLogStore((state) => state.toggle);

	const stopPropagationOnDoubleClick = React.useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
		},
		[],
	);

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: title bar double-click is a native macOS window management gesture */}
			<div
				onDoubleClick={mainProcess.onDoubleClickTitleBar}
				className="relative z-50 flex h-10 w-full shrink-0 items-center dark:bg-orgit-background px-2 electrobun-webkit-app-region-drag"
			>
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<StatusBar />
				</div>

				<div className="ml-auto inline-flex items-center">
					<Button
						data-sidebar="trigger"
						data-slot="sidebar-trigger"
						variant="ghost"
						className="p-1 cursor-pointer dark:text-slate-400 dark:hover:bg-orgit-hover electrobun-webkit-app-region-no-drag"
						size="icon"
						onClick={toggleLogPanel}
						onDoubleClick={stopPropagationOnDoubleClick}
					>
						<Logs className="size-4" />
					</Button>

					<Button
						data-sidebar="trigger"
						data-slot="sidebar-trigger"
						variant="ghost"
						className="p-1 cursor-pointer dark:text-slate-400 dark:hover:bg-orgit-hover electrobun-webkit-app-region-no-drag"
						size="icon"
						onClick={toggleSidebar}
						onDoubleClick={stopPropagationOnDoubleClick}
					>
						<PanelLeftIcon className="size-4" />
					</Button>
				</div>
			</div>
		</>
	);
}

export { Header };
