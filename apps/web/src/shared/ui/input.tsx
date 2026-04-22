import type * as React from "react";
import { cn } from "@/core/lib/cn";

export function Input({
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"h-11 w-full rounded-xl border border-[#d4def8] bg-white px-3 text-[#19254a] text-sm outline-none transition-colors placeholder:text-[#9ba5c2] focus:border-[#3a59d6] disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
