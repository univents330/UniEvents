import { ProtectedRoute } from "@/core/components/protected-route";
import { HostOrdersView } from "@/modules/orders";

export default function HostOrdersPage() {
	return (
		<ProtectedRoute allowedRoles={["HOST", "ADMIN"]}>
			<HostOrdersView />
		</ProtectedRoute>
	);
}
