import { ProtectedRoute } from "@/core/components/protected-route";
import { AttendeesView } from "@/modules/attendees";

export default function AttendeesPage() {
	return (
		<ProtectedRoute>
			<AttendeesView />
		</ProtectedRoute>
	);
}
