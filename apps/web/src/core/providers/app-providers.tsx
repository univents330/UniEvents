"use client";

import {
	QueryClient,
	type QueryClientConfig,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { CartProvider } from "./cart-provider";

const queryConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 30_000,
		},
	},
};

export function AppProviders({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient(queryConfig));

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<CartProvider>
					{children}
					<Toaster
						position="bottom-right"
						richColors
						toastOptions={{
							style: {
								fontFamily: "var(--font-jakarta), 'Segoe UI', sans-serif",
							},
						}}
					/>
				</CartProvider>
			</AuthProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
