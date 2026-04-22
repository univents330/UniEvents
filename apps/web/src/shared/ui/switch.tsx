"use client";

import { cn } from "@/core/lib/cn";

type SwitchProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	label: string;
	description?: string;
};

export function Switch({
	checked,
	onCheckedChange,
	disabled = false,
	label,
	description,
}: SwitchProps) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
			<div className="min-w-0">
				<p className="font-semibold text-[#1e2a4d]">{label}</p>
				{description && (
					<p className="mt-0.5 text-[#5f6984] text-xs">{description}</p>
				)}
			</div>

			<label className="flex items-center gap-3">
				<span
					className={cn(
						"font-semibold text-[11px] uppercase tracking-[0.22em]",
						checked ? "text-[#0f3dd9]" : "text-[#8a93ad]",
					)}
				>
					{checked ? "Host" : "User"}
				</span>

				<span className="relative inline-flex h-7 w-12 shrink-0 items-center">
					<input
						type="checkbox"
						checked={checked}
						disabled={disabled}
						onChange={(event) => onCheckedChange(event.target.checked)}
						aria-label={label}
						className="peer sr-only"
					/>
					<span
						className={cn(
							"absolute inset-0 rounded-full border transition-colors",
							checked
								? "border-[#0f3dd9] bg-[#0f3dd9]"
								: "border-[#cfd8f4] bg-[#dfe7f8]",
							disabled && "opacity-60",
						)}
					/>
					<span
						className={cn(
							"absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(15,61,217,0.22)] transition-transform",
							checked ? "translate-x-5" : "translate-x-0",
							disabled && "opacity-60",
						)}
					/>
				</span>
			</label>
		</div>
	);
}
