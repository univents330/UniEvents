"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MobileMenuProvider } from "@/shared/context/mobile-menu-context";
import { queryClient } from "@/shared/lib/query-client";
import { TopLoader } from "@/shared/ui/top-loader/top-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<MobileMenuProvider>
				<Suspense fallback={null}>
					<TopLoader />
				</Suspense>
				{children}
				<Toaster richColors position="top-right" />
				<ReactQueryDevtools initialIsOpen={false} />
			</MobileMenuProvider>
		</QueryClientProvider>
	);
}
