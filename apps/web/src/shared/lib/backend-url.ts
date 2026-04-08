import { env } from "@voltaze/env/web";

const ACTIVE_BACKEND_KEY = "voltaze_active_backend_url";

function normalizeUrl(value: string) {
	return value.trim().replace(/\/+$/, "");
}

function getConfiguredBackendUrls() {
	const list = [
		env.NEXT_PUBLIC_SERVER_URL,
		...(env.NEXT_PUBLIC_SERVER_URLS
			? env.NEXT_PUBLIC_SERVER_URLS.split(",")
			: []),
	]
		.map(normalizeUrl)
		.filter(Boolean);

	return [...new Set(list)];
}

function getLocalBackendUrl(configured: string[]) {
	return configured.find((url) => {
		try {
			const parsed = new URL(url);
			return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
		} catch {
			return false;
		}
	});
}

export function getAvailableBackendUrls() {
	return getConfiguredBackendUrls();
}

export function getActiveBackendUrl() {
	if (typeof window === "undefined") {
		return normalizeUrl(env.NEXT_PUBLIC_SERVER_URL);
	}

	const configured = getConfiguredBackendUrls();
	const isLocalFrontend =
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1";

	if (isLocalFrontend) {
		const localBackend = getLocalBackendUrl(configured);
		if (localBackend) {
			return localBackend;
		}
	}

	const stored = localStorage.getItem(ACTIVE_BACKEND_KEY);
	if (stored) {
		const normalized = normalizeUrl(stored);
		if (configured.includes(normalized)) {
			return normalized;
		}
	}

	return normalizeUrl(env.NEXT_PUBLIC_SERVER_URL);
}

export function setActiveBackendUrl(url: string) {
	const normalized = normalizeUrl(url);
	const configured = getConfiguredBackendUrls();

	if (!configured.includes(normalized)) {
		throw new Error("Backend URL is not listed in NEXT_PUBLIC_SERVER_URLS");
	}

	if (typeof window !== "undefined") {
		localStorage.setItem(ACTIVE_BACKEND_KEY, normalized);
	}
}

export function resetActiveBackendUrl() {
	if (typeof window !== "undefined") {
		localStorage.removeItem(ACTIVE_BACKEND_KEY);
	}
}
