import { ProtectedRoute } from "@/core/components/protected-route";
import { EditEventView } from "@/modules/events/views/edit-event-view";

type EditEventPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
	const { id } = await params;

	return (
		<ProtectedRoute allowedRoles={["HOST", "ADMIN"]}>
			<EditEventView eventId={id} />
		</ProtectedRoute>
	);
}
