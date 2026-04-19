import { env } from "@voltaze/env/web";

const ACTIVE_BACKEND_KEY = "voltaze_active_backend_url";

function normalizeUrl(value: string) {
	return value.trim().replace(/\/+$/, "");
}

function normalizeConfiguredList(value?: string) {
	return value ? value.split(",").map(normalizeUrl).filter(Boolean) : [];
}

function isLocalHostname(hostname: string) {
	return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalUrl(url: string) {
	try {
		const parsed = new URL(url);
		return isLocalHostname(parsed.hostname);
	} catch {
		return false;
	}
}

function getConfiguredBackendUrls() {
	const list = [
		env.NEXT_PUBLIC_API_URL,
		env.NEXT_PUBLIC_SERVER_URL,
		...normalizeConfiguredList(env.NEXT_PUBLIC_API_URLS),
		...normalizeConfiguredList(env.NEXT_PUBLIC_SERVER_URLS),
	]
		.map(normalizeUrl)
		.filter(Boolean);

	return [...new Set(list)];
}

function getLocalBackendUrl(configured: string[]) {
	return configured.find((url) => isLocalUrl(url));
}

function getDeployedBackendUrl(configured: string[]) {
	const preferredHostnames = ["api.unievent.in"];
	const preferred = configured.find((url) => {
		try {
			return preferredHostnames.includes(new URL(url).hostname);
		} catch {
			return false;
		}
	});

	if (preferred) {
		return preferred;
	}

	return configured.find((url) => !isLocalUrl(url));
}

export function getAvailableBackendUrls() {
	return getConfiguredBackendUrls();
}

export function getActiveBackendUrl() {
	if (typeof window === "undefined") {
		return normalizeUrl(env.NEXT_PUBLIC_API_URL ?? env.NEXT_PUBLIC_SERVER_URL);
	}

	const configured = getConfiguredBackendUrls();
	const isLocalFrontend = isLocalHostname(window.location.hostname);

	if (isLocalFrontend) {
		const localBackend = getLocalBackendUrl(configured);
		if (localBackend) {
			return localBackend;
		}
	} else {
		const deployedBackend = getDeployedBackendUrl(configured);
		if (deployedBackend) {
			const stored = localStorage.getItem(ACTIVE_BACKEND_KEY);
			if (stored) {
				const normalizedStored = normalizeUrl(stored);
				if (
					configured.includes(normalizedStored) &&
					!isLocalUrl(normalizedStored)
				) {
					return normalizedStored;
				}
			}

			return deployedBackend;
		}
	}

	const stored = localStorage.getItem(ACTIVE_BACKEND_KEY);
	if (stored) {
		const normalized = normalizeUrl(stored);
		if (configured.includes(normalized)) {
			return normalized;
		}
	}

	return normalizeUrl(env.NEXT_PUBLIC_API_URL ?? env.NEXT_PUBLIC_SERVER_URL);
}

export function setActiveBackendUrl(url: string) {
	const normalized = normalizeUrl(url);
	const configured = getConfiguredBackendUrls();

	if (!configured.includes(normalized)) {
		throw new Error(
			"Backend URL is not listed in the configured public backend URLs",
		);
	}

	if (typeof window !== "undefined") {
		if (!isLocalHostname(window.location.hostname) && isLocalUrl(normalized)) {
			throw new Error("Local backend URLs are blocked on production domains");
		}

		localStorage.setItem(ACTIVE_BACKEND_KEY, normalized);
	}
}

export function resetActiveBackendUrl() {
	if (typeof window !== "undefined") {
		localStorage.removeItem(ACTIVE_BACKEND_KEY);
	}
}
