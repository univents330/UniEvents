"use client";

import {
	Button,
	Card,
	Container,
	Divider,
	Group,
	SimpleGrid,
	Stack,
	Text,
} from "@mantine/core";
import { IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEvent, useTicketTiers } from "@/features/events";
import { formatCurrency, formatDateTime } from "@/shared/utils";

export default function EventDetailPage() {
	const params = useParams();
	const router = useRouter();
	const eventSlug = params.slug as string;

	const {
		data: event,
		isLoading: eventLoading,
		error: eventError,
	} = useEvent(eventSlug);
	const { data: tiers, isLoading: tiersLoading } = useTicketTiers(
		event?.id || "",
	);

	if (eventError) {
		return (
			<Container size="md">
				<Text c="red">
					Failed to load event details. Please try again later.
				</Text>
			</Container>
		);
	}

	if (eventLoading) {
		return (
			<Container size="md">
				<Text>Loading event details...</Text>
			</Container>
		);
	}

	if (!event) {
		return (
			<Container size="md">
				<Text c="dimmed">Event not found.</Text>
			</Container>
		);
	}

	return (
		<Container size="md">
			<Stack gap="xl">
				<div>
					<Group justify="space-between" mb="md">
						<Text size="sm" c="dimmed">
							{event.status}
						</Text>
					</Group>

					<Text fw={700} size="xl">
						{event.name}
					</Text>
					{event.description && <Text c="dimmed">{event.description}</Text>}
				</div>

				<Stack gap="md">
					<Group gap="md">
						<IconCalendar size={20} stroke={1.5} />
						<div>
							<Text size="sm" c="dimmed">
								Start
							</Text>
							<Text fw={500}>{formatDateTime(event.startDate)}</Text>
						</div>
					</Group>

					<Group gap="md">
						<IconClock size={20} stroke={1.5} />
						<div>
							<Text size="sm" c="dimmed">
								End
							</Text>
							<Text fw={500}>{formatDateTime(event.endDate)}</Text>
						</div>
					</Group>

					<Group gap="md">
						<IconMapPin size={20} stroke={1.5} />
						<div>
							<Text size="sm" c="dimmed">
								Venue
							</Text>
							<Text fw={500}>{event.venueName}</Text>
							<Text size="sm" c="dimmed">
								{event.address}
							</Text>
						</div>
					</Group>
				</Stack>

				{event.user && (
					<div>
						<Text size="sm" c="dimmed">
							Hosted by
						</Text>
						<Text fw={500}>{event.user.name || event.user.email}</Text>
					</div>
				)}

				<Divider />

				<div>
					<Text size="xl" fw={600} mb="md">
						Tickets
					</Text>

					{tiersLoading ? (
						<Text>Loading tickets...</Text>
					) : !tiers || tiers.length === 0 ? (
						<Text c="dimmed">
							Tickets for this event are not available yet.
						</Text>
					) : (
						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
							{tiers.map((tier) => (
								<Card key={tier.id} withBorder radius="md" p="md">
									<Stack gap="sm">
										<Group justify="space-between">
											<Text fw={600}>{tier.name}</Text>
											<Text fw={700}>{formatCurrency(tier.price / 100)}</Text>
										</Group>
										{tier.description && (
											<Text c="dimmed" size="sm">
												{tier.description}
											</Text>
										)}
										<Button
											onClick={() =>
												router.push(
													`/events/${event.slug}/checkout?tierId=${tier.id}`,
												)
											}
										>
											Select
										</Button>
									</Stack>
								</Card>
							))}
						</SimpleGrid>
					)}
				</div>
			</Stack>
		</Container>
	);
}
