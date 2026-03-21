"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import { Toaster } from "@voltaze/ui/components/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { ThemeProvider } from "./theme-provider";

type AuthLinkProps = {
	href: string;
	className?: string;
	children: React.ReactNode;
};

export default function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const navigate = (href: string) => {
		router.push(href as never);
	};

	const replace = (href: string) => {
		router.replace(href as never);
	};

	const AuthLink = ({ href, className, children }: AuthLinkProps) => {
		return (
			<Link href={href as never} className={className}>
				{children}
			</Link>
		);
	};

	return (
		<NeonAuthUIProvider
			authClient={authClient}
			navigate={navigate}
			replace={replace}
			onSessionChange={() => {
				router.refresh();
			}}
			social={{
				providers: ["google"],
			}}
			redirectTo="/"
			Link={AuthLink}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster richColors />
			</ThemeProvider>
		</NeonAuthUIProvider>
	);
}
