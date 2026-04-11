"use client";

import { PageHeader } from "@/shared/ui/page-header";

export default function SessionsPage() {
	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<PageHeader
				title="Session Settings"
				description="Manage your active sessions"
			/>

			<div className="rounded-lg border border-slate-200 bg-white p-6">
				<p className="text-slate-600">Session management coming soon...</p>
			</div>
		</div>
	);
}
