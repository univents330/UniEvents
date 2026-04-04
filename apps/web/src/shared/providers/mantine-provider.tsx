"use client";

import { MantineProvider as BaseMantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/styles/theme";

export function MantineProvider({ children }: { children: React.ReactNode }) {
	return (
		<BaseMantineProvider theme={theme}>
			<Notifications position="top-right" />
			<ModalsProvider>{children}</ModalsProvider>
		</BaseMantineProvider>
	);
}
