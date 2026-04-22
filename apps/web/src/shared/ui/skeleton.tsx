import type * as React from "react";
import { cn } from "@/core/lib/cn";

export function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-xl bg-[#e4ecfd]", className)}
			{...props}
		/>
	);
}
