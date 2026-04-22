import { ProtectedRoute } from "@/core/components/protected-route";
import { TicketsView } from "@/modules/tickets";

export default function TicketsPage() {
	return (
		<ProtectedRoute>
			<TicketsView />
		</ProtectedRoute>
	);
}
