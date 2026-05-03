"use client";

import { Footer } from "@/shared/ui/footer";
import { Navbar } from "@/shared/ui/navbar/navbar";

export default function MarketingGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#f8fbff]">
			<Navbar />
			{children}
			<Footer />
		</div>
	);
}
