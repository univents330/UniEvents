"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/shared/ui/navbar";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isDashboardShell =
		pathname.startsWith("/user") || pathname.startsWith("/host");

	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<main
				className={
					isDashboardShell
						? "w-full pt-16 lg:pt-20"
						: "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12"
				}
			>
				<div className={isDashboardShell ? "" : "pt-8 sm:pt-10 md:pt-12"}>
					{children}
				</div>
			</main>
		</div>
	);
}
