import { ProtectedRoute } from "@/core/components/protected-route";
import { NotificationsView } from "@/modules/notifications";

export default function NotificationsPage() {
	return (
		<ProtectedRoute>
			<NotificationsView />
		</ProtectedRoute>
	);
}
