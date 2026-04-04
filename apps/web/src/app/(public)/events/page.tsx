"use client";

import {
	Card,
	Container,
	Group,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { useEvents } from "@/features/events";
import { formatDate } from "@/shared/utils";

export default function EventsPage() {
	const [search, setSearch] = useState("");
	const { data, isLoading, error } = useEvents({ page: 1, limit: 12 });

	if (error) {
		return (
			<Container size="xl">
				<Title order={1}>Events</Title>
				<Text c="dimmed" mb="md">
					Discover upcoming events
				</Text>
				<Text c="red">Failed to load events. Please try again later.</Text>
			</Container>
		);
	}

	if (isLoading) {
		return (
			<Container size="xl">
				<Title order={1}>Events</Title>
				<Text c="dimmed" mb="md">
					Discover upcoming events
				</Text>
				<Text>Loading events...</Text>
			</Container>
		);
	}

	const filteredEvents =
		data?.data.filter(
			(event) =>
				event.name.toLowerCase().includes(search.toLowerCase()) ||
				event.description?.toLowerCase().includes(search.toLowerCase()) ||
				event.venueName.toLowerCase().includes(search.toLowerCase()) ||
				event.address.toLowerCase().includes(search.toLowerCase()),
		) || [];

	return (
		<Container size="xl">
			<Title order={1}>Events</Title>
			<Text c="dimmed" mb="md">
				Discover upcoming events
			</Text>

			<Stack gap="xl">
				<TextInput
					placeholder="Search events..."
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(e) => setSearch(e.currentTarget.value)}
				/>

				{filteredEvents.length === 0 ? (
					<Text c="dimmed">
						{search
							? "No events found. Try adjusting your search."
							: "No events available at the moment."}
					</Text>
				) : (
					<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
						{filteredEvents.map((event) => (
							<Card
								key={event.id}
								shadow="sm"
								padding="lg"
								radius="md"
								withBorder
								component={Link}
								href={`/events/${event.slug}`}
							>
								<Stack gap="xs">
									<Group justify="space-between">
										<Text fw={600}>{event.name}</Text>
										<Text size="xs" c="dimmed">
											{event.status}
										</Text>
									</Group>
									<Text size="sm" c="dimmed">
										{event.venueName}
									</Text>
									<Text size="sm">{formatDate(event.startDate)}</Text>
								</Stack>
							</Card>
						))}
					</SimpleGrid>
				)}
			</Stack>
		</Container>
	);
}
