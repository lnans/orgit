import { cn } from "@client/lib/utils";

export type GitStatProps = {
	className?: string;
	number: number;
	icon: React.ReactNode;
};

export function GitStat({ className, number, icon }: GitStatProps) {
	if (number === 0) {
		return null;
	}
	return (
		<div className={cn("inline-flex items-center text-[10px]", className)}>
			{icon}
			{number}
		</div>
	);
}
