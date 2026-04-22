"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/core/lib/cn";

interface Tab {
	value: string;
	label: string;
	content: ReactNode;
}

export function Tabs({
	tabs,
	defaultValue,
	className,
}: {
	tabs: Tab[];
	defaultValue?: string;
	className?: string;
}) {
	const [active, setActive] = useState(defaultValue ?? tabs[0]?.value ?? "");
	const currentTab = tabs.find((tab) => tab.value === active);

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex gap-1 rounded-xl border border-[#d4def8] bg-[#f4f7ff] p-1">
				{tabs.map((tab) => (
					<button
						key={tab.value}
						type="button"
						onClick={() => setActive(tab.value)}
						className={cn(
							"flex-1 rounded-lg px-4 py-2 font-semibold text-sm transition-all",
							active === tab.value
								? "bg-white text-[#0f3dd9] shadow-sm"
								: "text-[#5f6984] hover:text-[#1e2a4d]",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>
			{currentTab?.content}
		</div>
	);
}
