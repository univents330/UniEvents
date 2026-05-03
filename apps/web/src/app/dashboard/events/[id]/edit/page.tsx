import { ProtectedRoute } from "@/core/components/protected-route";
import { EditEventView } from "@/modules/events";

type EditEventPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
	const { id } = await params;

	return (
		<ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
			<EditEventView eventId={id} />
		</ProtectedRoute>
	);
}
