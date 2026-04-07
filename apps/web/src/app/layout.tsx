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
	title: "UniEvent",
	description: "Create, manage, and attend events with UniEvent",
	icons: {
		icon: "/assets/logo_circle_svg.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={poppins.variable}>
			<body suppressHydrationWarning className="font-poppins antialiased">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
