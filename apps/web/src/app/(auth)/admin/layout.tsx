"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/features/auth";
import { AdminSidebar } from "@/shared/ui/admin-sidebar";

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const { data: user, isLoading } = useCurrentUser();

	useEffect(() => {
		if (isLoading) {
			return;
		}

		if (user?.role !== "ADMIN") {
			router.replace("/user/dashboard" as Route);
		}
	}, [isLoading, user?.role, router]);

	if (isLoading || user?.role !== "ADMIN") {
		return (
			<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]" />
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			<AdminSidebar />
			<main className="fixed top-16 right-0 bottom-0 left-64 overflow-y-auto overflow-x-hidden">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-[#d7e8ff]/70 via-[#e9f2ff]/35 to-transparent"
				/>
				<div className="relative px-6 pt-2 pb-6 md:px-8 md:pt-3 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
