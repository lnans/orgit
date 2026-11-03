import { cn } from "@renderer/utils/className";
import type React from "react";

type TextProps = {
	children: React.ReactNode;
	className?: string;
};

export function Text({ children, className }: TextProps) {
	return <p className={cn("text-2xs", className)}>{children}</p>;
}
