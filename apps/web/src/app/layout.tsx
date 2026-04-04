import "@mantine/core/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/shared/providers";

export const metadata: Metadata = {
	title: "Voltaze - Event Ticketing Platform",
	description: "Create, manage, and attend events with Voltaze",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
