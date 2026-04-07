"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/shared/lib/query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<Toaster richColors position="top-right" />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
