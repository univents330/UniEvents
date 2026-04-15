import { PageHeader } from "@/shared/ui/page-header";

export default function AdminPaymentsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Payments"
				description="Monitor transaction volume, refunds, and reconciliation tasks."
			/>
			<div className="grid gap-4 md:grid-cols-3">
				<SummaryCard label="Gross volume" value="--" />
				<SummaryCard label="Successful" value="--" />
				<SummaryCard label="Refunds" value="--" />
			</div>
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 text-slate-600">
				Connect this page to the payments admin endpoints when they are
				available.
			</div>
		</div>
	);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm">
			<p className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">
				{label}
			</p>
			<p className="mt-2 font-black text-2xl text-slate-900">{value}</p>
		</div>
	);
}
