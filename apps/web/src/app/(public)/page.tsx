"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function HomePage() {
	return (
		<Container size="md" mt={100}>
			<Stack align="center" gap="xl">
				<Title order={1} size={48}>
					Welcome to Voltaze
				</Title>
				<Text size="xl" c="dimmed" ta="center">
					Your all-in-one event ticketing and management platform
				</Text>
				<Stack gap="md" mt="xl">
					<Button component={Link} href="/events" size="lg" fullWidth>
						Browse Events
					</Button>
					<Button
						component={Link}
						href="/login"
						size="lg"
						variant="outline"
						fullWidth
					>
						Sign In
					</Button>
					<Button
						component={Link}
						href="/register"
						size="lg"
						variant="subtle"
						fullWidth
					>
						Create Account
					</Button>
				</Stack>
			</Stack>
		</Container>
	);
}
