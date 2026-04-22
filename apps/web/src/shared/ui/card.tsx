import type * as React from "react";
import { cn } from "@/core/lib/cn";

export function Card({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("panel", className)} {...props} />;
}

export function CardTitle({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3
			className={cn("display-font font-bold text-xl", className)}
			{...props}
		/>
	);
}

export function CardText({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn("text-[#5f6984] text-sm", className)} {...props} />;
}
