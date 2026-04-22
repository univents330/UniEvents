import { ProtectedRoute } from "@/core/components/protected-route";
import { PaymentsView } from "@/modules/payments";

export default function PaymentsPage() {
	return (
		<ProtectedRoute>
			<PaymentsView />
		</ProtectedRoute>
	);
}
