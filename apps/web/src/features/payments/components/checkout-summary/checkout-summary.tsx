import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type CheckoutSummaryEvent = {
	startDate: string | Date;
	venueName: string;
};

type CheckoutSummaryTier = {
	name: string;
	price: number;
};

export interface CheckoutSummaryProps {
	event: CheckoutSummaryEvent;
	selectedTier: CheckoutSummaryTier | null;
	className?: string;
	currency?: string;
}

function formatMoney(amount: number, currency: string) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount / 100);
}

export function CheckoutSummary({
	event,
	selectedTier,
	className,
	currency = "INR",
}: CheckoutSummaryProps) {
	return (
		<aside className={cn("rounded-2xl bg-[#e8eefc] p-6 shadow-sm", className)}>
			<div className="space-y-3 text-[#0f172a] text-xs">
				<div className="flex items-start gap-2">
					<CalendarDays className="mt-0.5 h-4 w-4 text-[#4f46e5]" />
					<div>
						<p className="font-semibold text-[#1d4ed8] uppercase tracking-wide">
							Date & Time
						</p>
						<p>{new Date(event.startDate).toLocaleString()}</p>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<MapPin className="mt-0.5 h-4 w-4 text-[#4f46e5]" />
					<div>
						<p className="font-semibold text-[#1d4ed8] uppercase tracking-wide">
							Location
						</p>
						<p>{event.venueName}</p>
					</div>
				</div>
			</div>

			<div className="mt-6 border-slate-300 border-t pt-4 text-sm">
				<p className="text-slate-600">Selected Ticket</p>
				<p className="mt-1 font-semibold text-slate-900">
					{selectedTier?.name ?? "-"}
				</p>
				<p className="mt-1 text-slate-700">
					{selectedTier ? formatMoney(selectedTier.price, currency) : "-"}
				</p>
				<div className="mt-4 flex items-center justify-between border-slate-300 border-t pt-3">
					<span className="font-semibold text-slate-700">Total Amount</span>
					<span className="font-bold text-[#070190] text-lg">
						{selectedTier ? formatMoney(selectedTier.price, currency) : "-"}
					</span>
				</div>
				<p className="mt-2 text-[11px] text-slate-500">Taxes included</p>
			</div>

			<div className="mt-6 flex items-center gap-2 text-[#0f766e] text-xs">
				<CheckCircle2 className="h-4 w-4" />
				<span>Secure checkout powered by Razorpay</span>
			</div>
		</aside>
	);
}
