import { ProtectedRoute } from "@/core/components/protected-route";
import { EventManagementView } from "@/modules/events";

type EventManagementPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EventManagementPage({
	params,
}: EventManagementPageProps) {
	const { id } = await params;

	return (
		<ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
			<EventManagementView eventId={id} />
		</ProtectedRoute>
	);
}
