"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { HostSidebar } from "@/shared/ui/host-sidebar";

export default function HostLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const _pathname = usePathname();
	const mainRef = useRef<HTMLElement>(null);

	useEffect(() => {
		mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			<HostSidebar />
			{/* Main Content Area - scrollable with top sidebar */}
			<main
				ref={mainRef}
				className="w-full pt-20 lg:fixed lg:top-32 lg:right-0 lg:bottom-0 lg:left-0 lg:w-auto lg:overflow-y-auto lg:overflow-x-hidden"
			>
				<div className="relative px-4 pt-14 pb-6 sm:px-6 sm:pt-6 md:px-8 md:pt-3 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
