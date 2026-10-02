import { cn } from "@renderer/utils/className";
import type React from "react";

type TextProps = {
	children: React.ReactNode;
	className?: string;
};

export function Text({ children, className }: TextProps) {
	return <p className={cn("font-jet text-xs", className)}>{children}</p>;
}
