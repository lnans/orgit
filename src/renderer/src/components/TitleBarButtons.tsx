import { IPC } from "@renderer/ipcRenderer";
import { cn } from "@renderer/utils/className";
import {
	IconMinus,
	IconPlus,
	type IconProps,
	IconX,
} from "@tabler/icons-react";

export function TitleBarButtons() {
	return (
		<div className="absolute window-no-drag top-2.5 h-7 px-3 z-999">
			<div className="group flex items-center space-x-2.25">
				<TitleBarButton
					icon={IconX}
					color="bg-traffic-red"
					onClick={IPC.windowClose}
				/>
				<TitleBarButton
					icon={IconMinus}
					color="bg-traffic-orange"
					onClick={IPC.windowMinimize}
				/>
				<TitleBarButton
					icon={IconPlus}
					color="bg-traffic-green"
					onClick={IPC.windowMaximize}
				/>
			</div>
		</div>
	);
}

function TitleBarButton({
	icon,
	color,
	onClick,
}: {
	icon: React.ForwardRefExoticComponent<
		IconProps & React.RefAttributes<SVGSVGElement>
	>;
	color: string;
	onClick?: () => void;
}) {
	const Icon = icon;
	return (
		<button
			className={cn(
				"flex items-center justify-center w-3.5 h-3.5 rounded-full",
				color,
			)}
			type="button"
			onClick={onClick}
		>
			<Icon
				className="opacity-0 group-hover:opacity-55"
				stroke={4}
				height={11}
			/>
		</button>
	);
}
