import { ProtectedRoute } from "@/core/components/protected-route";
import { CheckInsView } from "@/modules/check-ins";

export default function CheckInsPage() {
	return (
		<ProtectedRoute>
			<CheckInsView />
		</ProtectedRoute>
	);
}
