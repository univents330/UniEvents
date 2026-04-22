import { ProtectedRoute } from "@/core/components/protected-route";
import { CheckInsView } from "@/modules/check-ins";

export default function HostCheckInsPage() {
	return (
		<ProtectedRoute allowedRoles={["HOST", "ADMIN"]}>
			<CheckInsView />
		</ProtectedRoute>
	);
}
