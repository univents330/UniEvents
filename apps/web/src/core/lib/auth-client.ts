import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "@/core/lib/backend-url";

function getAuthBaseUrl(): string {
	const apiBase = getApiBaseUrl();

	if (apiBase.endsWith("/api")) {
		return `${apiBase}/auth`;
	}

	return `${apiBase}/api/auth`;
}

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
});
