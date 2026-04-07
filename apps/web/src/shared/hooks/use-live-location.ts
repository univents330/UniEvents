"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "unievent_live_location";
const LOCATION_SYNC_EVENT = "unievent:location-updated";

let sharedLocationLookupPromise: Promise<string | null> | null = null;

function normalizeLocation(value: string) {
	return value.trim().replace(/\s+/g, " ");
}

function readStoredLocation() {
	if (typeof window === "undefined") {
		return "";
	}

	const stored = window.localStorage.getItem(STORAGE_KEY);
	return stored ? normalizeLocation(stored) : "";
}

function persistLocation(nextLocation: string) {
	if (typeof window === "undefined") {
		return;
	}

	if (!nextLocation) {
		window.localStorage.removeItem(STORAGE_KEY);
	} else {
		window.localStorage.setItem(STORAGE_KEY, nextLocation);
	}

	window.dispatchEvent(
		new CustomEvent(LOCATION_SYNC_EVENT, {
			detail: { location: nextLocation },
		}),
	);
}

async function reverseGeocode(latitude: number, longitude: number) {
	const response = await fetch(
		`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
		{ cache: "no-store" },
	);

	if (!response.ok) {
		throw new Error("Reverse geocode request failed");
	}

	const data = (await response.json()) as {
		town?: string;
		village?: string;
		suburb?: string;
		city?: string;
		locality?: string;
		principalSubdivision?: string;
	};

	return normalizeLocation(
		data.locality ||
			data.city ||
			data.town ||
			data.village ||
			data.suburb ||
			data.principalSubdivision ||
			"",
	);
}

async function getCurrentCoordinates() {
	if (typeof navigator === "undefined" || !navigator.geolocation) {
		return null;
	}

	return new Promise<GeolocationPosition | null>((resolve) => {
		navigator.geolocation.getCurrentPosition(
			(position) => resolve(position),
			() => resolve(null),
			{
				enableHighAccuracy: false,
				timeout: 10_000,
				maximumAge: 300_000,
			},
		);
	});
}

async function lookupLiveLocation() {
	const position = await getCurrentCoordinates();
	if (!position) {
		return null;
	}

	const city = await reverseGeocode(
		position.coords.latitude,
		position.coords.longitude,
	);

	return city || null;
}

function getSharedLocationLookup() {
	if (!sharedLocationLookupPromise) {
		sharedLocationLookupPromise = lookupLiveLocation().finally(() => {
			sharedLocationLookupPromise = null;
		});
	}

	return sharedLocationLookupPromise;
}

type UseLiveLocationOptions = {
	fallback?: string;
	autoDetect?: boolean;
};

export function useLiveLocation(options?: UseLiveLocationOptions) {
	const fallback = normalizeLocation(options?.fallback || "");
	const autoDetect = options?.autoDetect ?? true;
	const [location, setLocation] = useState(
		() => readStoredLocation() || fallback,
	);
	const [isLocating, setIsLocating] = useState(false);

	const updateLocation = useCallback((value: string) => {
		const normalized = normalizeLocation(value);
		setLocation(normalized);
		persistLocation(normalized);
	}, []);

	const detectLocation = useCallback(async () => {
		setIsLocating(true);

		try {
			const detected = await getSharedLocationLookup();
			if (detected) {
				updateLocation(detected);
				return detected;
			}
		} catch {
			// Keep current location if browser geolocation or reverse geocoding fails.
		} finally {
			setIsLocating(false);
		}

		return null;
	}, [updateLocation]);

	useEffect(() => {
		const stored = readStoredLocation();
		if (stored) {
			setLocation(stored);
		}

		if (!stored && fallback) {
			setLocation(fallback);
		}

		if (!autoDetect) {
			return;
		}

		void detectLocation();
	}, [autoDetect, detectLocation, fallback]);

	useEffect(() => {
		const onStorage = (event: StorageEvent) => {
			if (event.key !== STORAGE_KEY) {
				return;
			}

			setLocation(normalizeLocation(event.newValue || "") || fallback);
		};

		const onLocationSync = (event: Event) => {
			const customEvent = event as CustomEvent<{ location?: string }>;
			setLocation(
				normalizeLocation(customEvent.detail?.location || "") || fallback,
			);
		};

		window.addEventListener("storage", onStorage);
		window.addEventListener(
			LOCATION_SYNC_EVENT,
			onLocationSync as EventListener,
		);

		return () => {
			window.removeEventListener("storage", onStorage);
			window.removeEventListener(
				LOCATION_SYNC_EVENT,
				onLocationSync as EventListener,
			);
		};
	}, [fallback]);

	const effectiveLocation = useMemo(
		() => normalizeLocation(location || fallback),
		[fallback, location],
	);

	return {
		location: effectiveLocation,
		setLocation: updateLocation,
		isLocating,
		detectLocation,
	};
}
