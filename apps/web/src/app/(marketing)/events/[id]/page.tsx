import { EventDetailView } from "@/modules/events";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: PageProps) {
	const { id } = await params;
	return <EventDetailView eventId={id} />;
}
