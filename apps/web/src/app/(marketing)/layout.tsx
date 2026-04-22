"use client";

import { usePathname } from "next/navigation";
import { MarketingLayout } from "@/modules/marketing/components/marketing-layout";

export default function MarketingGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isCheckout = pathname.startsWith("/checkout");

	return (
		<MarketingLayout hideHeader={isCheckout} hideFooter={isCheckout}>
			{children}
		</MarketingLayout>
	);
}
