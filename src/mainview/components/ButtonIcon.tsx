import type { IconProps } from "@tabler/icons-react";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/client/lib/utils";

const variants = cva(
	"flex items-center justify-center size-5 cursor-pointer rounded-md text-neutral-500 transition-colors duration-75 active:scale-95",
	{
		variants: {
			variant: {
				default: "hover:bg-neutral-500/10 hover:text-neutral-400",
				ghost: "hover:text-neutral-400",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type ButtonIconProps = React.ComponentProps<"button"> &
	VariantProps<typeof variants> & {
		icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
	};

export function ButtonIcon({ icon, className, variant, ...props }: ButtonIconProps) {
	const Icon = icon;
	return (
		<button className={cn(variants({ variant }), className)} {...props}>
			<Icon size={12} />
		</button>
	);
}
