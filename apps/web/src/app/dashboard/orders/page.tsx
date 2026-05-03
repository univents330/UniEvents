import { ProtectedRoute } from "@/core/components/protected-route";
import { OrdersView } from "@/modules/orders";

export default function OrdersPage() {
	return (
		<ProtectedRoute>
			<OrdersView />
		</ProtectedRoute>
	);
}
