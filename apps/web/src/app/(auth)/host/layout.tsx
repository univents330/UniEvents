"use client";

import { HostSidebar } from "@/shared/ui/host-sidebar";

export default function HostLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			{/* Desktop Sidebar - Hidden on Mobile */}
			<div className="hidden md:block">
				<HostSidebar />
			</div>

			{/* Main Content Area */}
			<main className="fixed top-16 right-0 bottom-0 left-0 overflow-y-auto overflow-x-hidden md:left-64">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-[#d7e8ff]/70 via-[#e9f2ff]/35 to-transparent"
				/>
				<div className="relative px-4 pt-2 pb-6 md:px-8 md:pt-3 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
