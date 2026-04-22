import { ProtectedRoute } from "@/core/components/protected-route";
import { HostEventsView } from "@/modules/events";

export default function HostEventsPage() {
	return (
		<ProtectedRoute allowedRoles={["HOST", "ADMIN"]}>
			<HostEventsView />
		</ProtectedRoute>
	);
}
