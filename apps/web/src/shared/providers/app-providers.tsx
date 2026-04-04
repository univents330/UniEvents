"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/shared/lib/query-client";
import { MantineProvider } from "./mantine-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider>
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</MantineProvider>
		</QueryClientProvider>
	);
}
