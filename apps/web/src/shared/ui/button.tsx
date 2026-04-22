import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/core/lib/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f61e8] disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				primary:
					"!text-white bg-[#0f3dd9] shadow-[0_10px_24px_rgba(15,61,217,0.24)] hover:bg-[#0c34bb]",
				ghost:
					"bg-white text-[#1b2440] ring-1 ring-[#d4def8] hover:bg-[#f4f7ff]",
			},
			size: {
				sm: "h-9 px-4 text-sm",
				md: "h-11 px-5 text-sm",
				lg: "h-12 px-6 text-base",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
