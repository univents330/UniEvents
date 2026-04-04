"use client";

import {
	Badge,
	Card,
	Container,
	Grid,
	Group,
	Text,
	Title,
} from "@mantine/core";
import {
	IconCalendarEvent,
	IconQrcode,
	IconShoppingCart,
	IconTicket,
} from "@tabler/icons-react";
import { useAuth } from "@/features/auth";

export default function DashboardPage() {
	const { user } = useAuth();

	return (
		<Container size="xl">
			<Title order={1} mb={4}>
				{`Welcome back${user?.name ? `, ${user.name}` : ""}!`}
			</Title>
			<Text c="dimmed" mb="xl">
				{"Here's what's happening with your events and tickets"}
			</Text>

			<Grid>
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card>
						<Group justify="apart">
							<div>
								<Text c="dimmed" size="xs" tt="uppercase" fw={700}>
									My Tickets
								</Text>
								<Title order={2}>0</Title>
							</div>
							<IconTicket size={32} stroke={1.5} />
						</Group>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card>
						<Group justify="apart">
							<div>
								<Text c="dimmed" size="xs" tt="uppercase" fw={700}>
									Upcoming Events
								</Text>
								<Title order={2}>0</Title>
							</div>
							<IconCalendarEvent size={32} stroke={1.5} />
						</Group>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card>
						<Group justify="apart">
							<div>
								<Text c="dimmed" size="xs" tt="uppercase" fw={700}>
									Orders
								</Text>
								<Title order={2}>0</Title>
							</div>
							<IconShoppingCart size={32} stroke={1.5} />
						</Group>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<Card>
						<Group justify="apart">
							<div>
								<Text c="dimmed" size="xs" tt="uppercase" fw={700}>
									Passes
								</Text>
								<Title order={2}>0</Title>
							</div>
							<IconQrcode size={32} stroke={1.5} />
						</Group>
					</Card>
				</Grid.Col>
			</Grid>
		</Container>
	);
}
