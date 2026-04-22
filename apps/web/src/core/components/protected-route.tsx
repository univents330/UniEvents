"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";

export function ProtectedRoute({
	children,
	allowedRoles,
}: {
	children: React.ReactNode;
	allowedRoles?: string[];
}) {
	const { user: sessionUser, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		if (isLoading) return;

		if (!sessionUser) {
			router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
			return;
		}

		if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
			router.replace("/");
			return;
		}

		setIsAuthorized(true);
	}, [sessionUser, isLoading, router, pathname, allowedRoles]);

	if (isLoading || !isAuthorized) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d4def8] border-t-[#1264db]" />
			</div>
		);
	}

	return <>{children}</>;
}
