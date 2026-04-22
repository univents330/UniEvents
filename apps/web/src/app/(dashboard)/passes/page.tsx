import { ProtectedRoute } from "@/core/components/protected-route";
import { PassesView } from "@/modules/passes";

export default function PassesPage() {
	return (
		<ProtectedRoute>
			<PassesView />
		</ProtectedRoute>
	);
}
