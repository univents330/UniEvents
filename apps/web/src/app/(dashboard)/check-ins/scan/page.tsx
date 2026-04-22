import { ProtectedRoute } from "@/core/components/protected-route";
import { ScanView } from "@/modules/check-ins/views/scan-view";

export default function Page() {
	return (
		<ProtectedRoute allowedRoles={["ADMIN", "HOST"]}>
			<ScanView />
		</ProtectedRoute>
	);
}
