import { ProtectedRoute } from "@/core/components/protected-route";
import { CreateEventView } from "@/modules/events";

export default function CreateEventPage() {
	return (
		<ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
			<CreateEventView />
		</ProtectedRoute>
	);
}
