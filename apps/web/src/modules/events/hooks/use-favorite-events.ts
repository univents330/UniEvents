"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";

const FAVORITES_STORAGE_KEY_PREFIX = "UniEvent:favourite-event-ids";
const DEFAULT_SCOPE = "guest";

function getFavoritesStorageKey(scope: string) {
	return `${FAVORITES_STORAGE_KEY_PREFIX}:${scope}`;
}

function parseStoredFavorites(raw: string | null): Set<string> {
	if (!raw) {
		return new Set<string>();
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return new Set<string>();
		}

		return new Set(parsed.filter((value) => typeof value === "string"));
	} catch {
		return new Set<string>();
	}
}

export function useFavoriteEvents() {
	const { user } = useAuth();
	const userScope = user?.id || DEFAULT_SCOPE;
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		setFavoriteIds(
			parseStoredFavorites(
				localStorage.getItem(getFavoritesStorageKey(userScope)),
			),
		);
	}, [userScope]);

	const toggleFavorite = useCallback(
		(eventId: string) => {
			setFavoriteIds((prev) => {
				const next = new Set(prev);

				if (next.has(eventId)) {
					next.delete(eventId);
				} else {
					next.add(eventId);
				}

				localStorage.setItem(
					getFavoritesStorageKey(userScope),
					JSON.stringify([...next]),
				);
				return next;
			});
		},
		[userScope],
	);

	const isFavorite = useCallback(
		(eventId: string) => favoriteIds.has(eventId),
		[favoriteIds],
	);

	return useMemo(
		() => ({ favoriteIds, isFavorite, toggleFavorite }),
		[favoriteIds, isFavorite, toggleFavorite],
	);
}
