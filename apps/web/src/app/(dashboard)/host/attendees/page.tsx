import { ProtectedRoute } from "@/core/components/protected-route";
import { AttendeesView } from "@/modules/attendees";

export default function HostAttendeesPage() {
	return (
		<ProtectedRoute allowedRoles={["HOST", "ADMIN"]}>
			<AttendeesView />
		</ProtectedRoute>
	);
}
