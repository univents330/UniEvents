import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type CheckoutSummaryEvent = {
	startDate: string | Date;
	venueName: string;
};

type CheckoutSummaryTier = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

export interface CheckoutSummaryProps {
	event: CheckoutSummaryEvent;
	selectedTiers: CheckoutSummaryTier[];
	className?: string;
	currency?: string;
}

function formatMoney(amount: number, currency: string) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function CheckoutSummary({
	event,
	selectedTiers,
	className,
	currency = "INR",
}: CheckoutSummaryProps) {
	const totalAmount = selectedTiers.reduce(
		(total, tier) => total + tier.price * tier.quantity,
		0,
	);

	const totalTickets = selectedTiers.reduce(
		(total, tier) => total + tier.quantity,
		0,
	);

	return (
		<aside
			className={cn(
				"rounded-xl bg-[#e8eefc] p-4 shadow-sm sm:rounded-2xl sm:p-5 md:p-6",
				className,
			)}
		>
			<div className="space-y-2 text-[#0f172a] text-xs sm:space-y-3">
				<div className="flex items-start gap-1.5 sm:gap-2">
					<CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4f46e5] sm:h-4 sm:w-4" />
					<div className="min-w-0">
						<p className="font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide">
							Date & Time
						</p>
						<p className="mt-0.5 break-words text-xs sm:text-sm">
							{new Date(event.startDate).toLocaleString()}
						</p>
					</div>
				</div>
				<div className="flex items-start gap-1.5 sm:gap-2">
					<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4f46e5] sm:h-4 sm:w-4" />
					<div className="min-w-0">
						<p className="font-semibold text-[#1d4ed8] text-xs uppercase tracking-wide">
							Location
						</p>
						<p className="mt-0.5 break-words text-xs sm:text-sm">
							{event.venueName}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-4 border-slate-300 border-t pt-3 text-xs sm:mt-5 sm:pt-4 sm:text-sm md:mt-6">
				<p className="text-slate-600">Selected Ticket</p>
				<p className="mt-0.5 font-semibold text-slate-900 sm:mt-1">
					{selectedTier?.name ?? "-"}
				</p>
				<p className="mt-0.5 text-slate-700 sm:mt-1">
					{selectedTier ? formatMoney(selectedTier.price, currency) : "-"}
				</p>
				<div className="mt-3 flex items-center justify-between border-slate-300 border-t pt-2.5 sm:pt-3">
					<span className="font-semibold text-slate-700">Total Amount</span>
					<span className="font-bold text-[#070190] text-base sm:text-lg">
						{selectedTier ? formatMoney(selectedTier.price, currency) : "-"}
					</span>
				</div>
				<p className="mt-1.5 text-[10px] text-slate-500 sm:mt-2 sm:text-[11px]">
					Taxes included
				</p>
			</div>

			<div className="mt-4 flex items-center gap-1.5 text-[#0f766e] text-xs sm:mt-5 sm:gap-2 md:mt-6">
				<CheckCircle2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
				<span>Secure checkout powered by Razorpay</span>
			</div>
		</aside>
	);
}
