import { ProtectedRoute } from "@/core/components/protected-route";
import { EventAttendeesView } from "@/modules/events";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
	const { id } = await params;

	return (
		<ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
			<EventAttendeesView eventId={id} />
		</ProtectedRoute>
	);
}
