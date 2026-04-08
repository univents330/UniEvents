"use client";

import type { Payment } from "@voltaze/schema";
import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useRefundPayment } from "../../hooks/use-payments";

export interface RefundActionProps {
	payment: Pick<Payment, "id" | "amount" | "currency" | "status">;
	className?: string;
	label?: string;
	confirmMessage?: string;
	refundAmount?: number;
	notes?: Record<string, string>;
	onSuccess?: () => void | Promise<void>;
}

function formatMoney(amount: number, currency: string) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount / 100);
}

export function RefundAction({
	payment,
	className,
	label = "Refund payment",
	confirmMessage,
	refundAmount,
	notes,
	onSuccess,
}: RefundActionProps) {
	const refundPayment = useRefundPayment(payment.id);
	const [isConfirming, setIsConfirming] = useState(false);

	if (payment.status !== "SUCCESS") {
		return null;
	}

	const handleRefund = async () => {
		if (typeof window !== "undefined") {
			setIsConfirming(true);
			const confirmed = window.confirm(
				confirmMessage ??
					`Refund ${formatMoney(refundAmount ?? payment.amount, payment.currency)} for this payment?`,
			);
			setIsConfirming(false);

			if (!confirmed) {
				return;
			}
		}

		const refundPayload =
			refundAmount !== undefined || notes
				? {
						...(refundAmount !== undefined ? { amount: refundAmount } : {}),
						...(notes ? { notes } : {}),
					}
				: undefined;

		await refundPayment.mutateAsync(refundPayload);
		await onSuccess?.();
	};

	return (
		<div className={cn("flex items-center gap-3", className)}>
			<Button
				type="button"
				variant="destructive"
				onClick={() => void handleRefund()}
				disabled={refundPayment.isPending || isConfirming}
			>
				{refundPayment.isPending || isConfirming ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<RotateCcw className="mr-2 h-4 w-4" />
				)}
				{refundPayment.isPending || isConfirming ? "Processing..." : label}
			</Button>
		</div>
	);
}
