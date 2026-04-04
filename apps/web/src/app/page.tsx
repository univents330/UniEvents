import { Container, Stack, Text, Title } from "@mantine/core";

import { EventsPreview } from "@modules/events";

export default function HomePage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="xl">
				<Stack gap={4}>
					<Text c="dimmed" fw={700} size="xs" tt="uppercase">
						Voltaze web
					</Text>
					<Title order={1}>Clean module pattern</Title>
					<Text c="dimmed" maw={680}>
						Pages stay thin while each domain module owns its components, hooks,
						lib utilities, and types behind a single public index.
					</Text>
				</Stack>

				<EventsPreview />
			</Stack>
		</Container>
	);
}
