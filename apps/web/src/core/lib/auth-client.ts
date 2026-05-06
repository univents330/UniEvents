import { createAuthClient } from "better-auth/react";
import { getApiBaseUrl } from "@/core/lib/backend-url";

function getAuthBaseUrl(): string {
	const apiBase = getApiBaseUrl().replace(/\/+$/, "");

	// Ensure we always target the canonical `/auth` mount on the server.
	// If the configured API base accidentally includes a trailing `/api`, strip it.
	const baseWithoutApi = apiBase.replace(/\/api$/i, "");
	return `${baseWithoutApi}/auth`;
}

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
});
