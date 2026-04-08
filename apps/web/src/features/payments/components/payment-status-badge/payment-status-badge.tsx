import type { PaymentStatus } from "@voltaze/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

const paymentStatusStyles: Record<
	PaymentStatus,
	{ label: string; className: string }
> = {
	PENDING: {
		label: "Pending",
		className: "border-amber-200 bg-amber-50 text-amber-700",
	},
	SUCCESS: {
		label: "Success",
		className: "border-emerald-200 bg-emerald-50 text-emerald-700",
	},
	FAILED: {
		label: "Failed",
		className: "border-rose-200 bg-rose-50 text-rose-700",
	},
	REFUNDED: {
		label: "Refunded",
		className: "border-sky-200 bg-sky-50 text-sky-700",
	},
};

export interface PaymentStatusBadgeProps {
	status: PaymentStatus;
	className?: string;
}

export function PaymentStatusBadge({
	status,
	className,
}: PaymentStatusBadgeProps) {
	const meta = paymentStatusStyles[status];

	return (
		<Badge
			variant="outline"
			className={cn("border px-2.5 py-0.5", meta.className, className)}
		>
			{meta.label}
		</Badge>
	);
}
