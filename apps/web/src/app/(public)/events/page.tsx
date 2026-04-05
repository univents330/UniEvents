import { Container, Title, Text, Stack, Card, Group, Badge } from "@mantine/core";
import { IconSearch, IconMapPin } from "@tabler/icons-react";

export default async function EventsPage({
	searchParams,
}: {
	searchParams: Promise<{ search?: string; location?: string }>;
}) {
	const params = await searchParams;
	return (
		<Container size="lg" py="xl">
			<Stack gap="xl">
				<Stack gap="xs">
					<Title order={1}>Search Results</Title>
					<Text c="dimmed">Showing events matching your criteria</Text>
				</Stack>

				<Card withBorder radius="md" p="md">
					<Group gap="xl">
						<div className="flex items-center gap-2">
							<IconSearch size={20} className="text-gray-400" />
							<Text font-weight={600}>Search: </Text>
							<Badge size="lg" color="blue" variant="light">
								{(await searchParams).search || "All Events"}
							</Badge>
						</div>

						<div className="flex items-center gap-2" style={{ borderLeft: "1px solid #eee", paddingLeft: "24px" }}>
							<IconMapPin size={20} className="text-gray-400" />
							<Text font-weight={600}>Location: </Text>
							<Badge size="lg" color="cyan" variant="light">
								{(await searchParams).location || "Anywhere"}
							</Badge>
						</div>
					</Group>
				</Card>

				<Stack gap="md" py="xl" align="center">
					<Text c="dimmed" fs="italic">No events found yet. The backend integration is being developed.</Text>
				</Stack>
			</Stack>
		</Container>
	);
}
