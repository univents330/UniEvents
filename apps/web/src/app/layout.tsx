import "@mantine/core/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AppProviders } from "@/shared/providers";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-poppins",
});

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
		<html lang="en" className={poppins.variable}>
			<body className="antialiased font-poppins">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
