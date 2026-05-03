import { EventDetailView } from "@/modules/events/views/event-detail-view";

export default async function EventPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <EventDetailView eventId={id} />;
}
