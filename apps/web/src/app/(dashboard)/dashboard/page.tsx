import { ProtectedRoute } from "@/core/components/protected-route";
import { DashboardView } from "@/modules/dashboard";

export default function DashboardPage() {
	return (
		<ProtectedRoute>
			<DashboardView />
		</ProtectedRoute>
	);
}
