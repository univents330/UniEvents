"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/features/auth";
import { addNotification } from "@/shared/lib/notification-center";
import { useEvents } from "../hooks/use-events";

const STORAGE_KEY_PREFIX = "voltaze:event-moderation-snapshot";

function getStorageKey(userId: string) {
	return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function readSnapshot(userId: string): Record<string, string> {
	if (typeof window === "undefined") {
		return {};
	}

	const raw = window.localStorage.getItem(getStorageKey(userId));
	if (!raw) {
		return {};
	}

	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") {
			return {};
		}
		return parsed as Record<string, string>;
	} catch {
		return {};
	}
}

function writeSnapshot(userId: string, snapshot: Record<string, string>) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(getStorageKey(userId), JSON.stringify(snapshot));
}

export function EventModerationStatusNotifier() {
	const { data: user } = useCurrentUser();
	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	useEffect(() => {
		if (!user?.id || !eventsQuery.data?.data) {
			return;
		}

		const myEvents = eventsQuery.data.data.filter(
			(event) => event.userId === user.id,
		);
		const previousSnapshot = readSnapshot(user.id);
		const nextSnapshot: Record<string, string> = {};

		for (const event of myEvents) {
			nextSnapshot[event.id] = event.moderationStatus;

			const previousStatus = previousSnapshot[event.id];
			if (!previousStatus || previousStatus === event.moderationStatus) {
				continue;
			}

			if (
				previousStatus === "PENDING" &&
				event.moderationStatus === "APPROVED"
			) {
				addNotification({
					title: "Event approved",
					message: `Your event "${event.name}" is now live on the website.`,
					color: "green",
				});
			}

			if (
				previousStatus === "PENDING" &&
				event.moderationStatus === "REJECTED"
			) {
				addNotification({
					title: "Event rejected",
					message: `Your event "${event.name}" was rejected by admin review.`,
					color: "amber",
				});
			}
		}

		writeSnapshot(user.id, nextSnapshot);
	}, [eventsQuery.data?.data, user?.id]);

	return null;
}
