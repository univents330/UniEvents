"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { UserSidebar } from "@/shared/ui/user-sidebar";

export default function UserLayout({
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
			<UserSidebar />
			{/* Main Content Area - scrollable with top sidebar */}
			<main
				ref={mainRef}
				className="w-full pt-4 sm:pt-6 lg:fixed lg:top-16 lg:right-0 lg:bottom-0 lg:left-0 lg:w-auto lg:overflow-y-auto lg:overflow-x-hidden"
			>
				<div className="relative px-4 pt-2 pb-6 sm:px-6 sm:pt-3 md:px-8 md:pt-2 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
