import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/core/providers/app-providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-jakarta",
});

const display = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-display",
});

export const metadata: Metadata = {
	title: "UniEvent | Event Platform",
	description:
		"Discover events, view schedules, manage mobile tickets, and track readiness from one frontend experience.",
	// Expose manifest to browsers for install prompt support.
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon.png", type: "image/png" },
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
			{ url: "/favicon.ico", type: "image/x-icon" },
		],
		// iOS home screen icon for installable web app behavior.
		apple: [
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
		],
	},
	// Apple-specific install behavior metadata.
	appleWebApp: {
		capable: true,
		title: "UniEvent",
		statusBarStyle: "default",
	},
	formatDetection: {
		telephone: false,
	},
	other: {
		// Preserve broad installability support for older mobile browsers.
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-capable": "yes",
	},
};

// Theme color used by browser UI on Android and installed mode.
export const viewport: Viewport = {
	themeColor: "#111827",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${jakarta.variable} ${display.variable}`}>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
