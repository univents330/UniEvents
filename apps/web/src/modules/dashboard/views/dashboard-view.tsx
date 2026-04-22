"use client";

import { Loader2 } from "lucide-react";
import { useAuth } from "@/core/providers/auth-provider";
import { HostDashboard } from "../components/host-dashboard";
import { UserDashboard } from "../components/user-dashboard";

export function DashboardView() {
	const { user, isLoading: authLoading } = useAuth();

	if (authLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
				<Loader2 className="animate-spin" size={32} />
				<p className="font-black text-xs uppercase tracking-widest">
					Initializing Dashboard...
				</p>
			</div>
		);
	}

	if (user?.role === "HOST") {
		return <HostDashboard />;
	}

	return <UserDashboard />;
}
