"use client";

import { AppShell, Group, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<AppShell
				header={{ height: 60 }}
				navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: true } }}
			>
				<AppShell.Header p="md">
					<Group justify="space-between">
						<Text fw={700}>Voltaze</Text>
					</Group>
				</AppShell.Header>
				<AppShell.Main>
					<Text p="md">Loading...</Text>
				</AppShell.Main>
			</AppShell>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: true } }}
		>
			<AppShell.Header p="md">
				<Group justify="space-between">
					<Text fw={700}>Voltaze</Text>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="md">
				<Text size="sm" c="dimmed">
					Navigation
				</Text>
			</AppShell.Navbar>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
