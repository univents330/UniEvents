import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "@/core/lib/backend-url";

function getAuthBaseUrl(): string {
	const apiBase = getApiBaseUrl();

	if (apiBase.endsWith("/api")) {
		return apiBase.replace(/\/api$/, "/auth");
	}

	return `${apiBase}/auth`;
}

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
});
