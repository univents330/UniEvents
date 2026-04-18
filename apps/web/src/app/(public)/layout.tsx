"use client";

import { UserSidebar } from "@/shared/ui/user-sidebar";

export default function PublicLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<UserSidebar />
			{children}
		</>
	);
}
