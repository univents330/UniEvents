export default function UserPaymentsPage() {
	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="rounded-lg border border-slate-200 bg-white p-4 sm:rounded-xl sm:p-6">
				<h1 className="font-bold text-slate-900 text-xl sm:text-2xl">
					Payment History
				</h1>
				<p className="mt-2 text-slate-600 text-sm sm:text-base">
					View all your payment transactions. Coming soon!
				</p>
				<div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-6">
					<p className="text-center text-slate-600 text-sm sm:text-base">
						No payment records yet.
					</p>
				</div>
			</div>
		</div>
	);
}
