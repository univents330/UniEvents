"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateNotificationInput } from "@unievent/schema";
import {
	type NotificationListQuery,
	notificationsService,
} from "../services/notifications.service";

const notificationsKeys = {
	all: ["notifications"] as const,
	lists: () => [...notificationsKeys.all, "list"] as const,
	list: (query?: NotificationListQuery) =>
		[...notificationsKeys.lists(), query ?? {}] as const,
	details: () => [...notificationsKeys.all, "detail"] as const,
	detail: (id: string) => [...notificationsKeys.details(), id] as const,
	unreadCount: () => [...notificationsKeys.all, "unread-count"] as const,
};

export function useNotifications(query?: NotificationListQuery) {
	return useQuery({
		queryKey: notificationsKeys.list(query),
		queryFn: () => notificationsService.list(query),
	});
}

export function useNotification(id?: string) {
	return useQuery({
		queryKey: notificationsKeys.detail(id ?? ""),
		queryFn: () => notificationsService.getById(id as string),
		enabled: Boolean(id),
	});
}

export function useUnreadCount(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;

	return useQuery({
		queryKey: notificationsKeys.unreadCount(),
		queryFn: () => notificationsService.getUnreadCount(),
		refetchInterval: enabled ? 30_000 : false,
		enabled,
	});
}

export function useUpdateNotification(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateNotificationInput) =>
			notificationsService.update(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all,
			});
		},
	});
}

export function useMarkAllAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => notificationsService.markAllAsRead(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all,
			});
		},
	});
}

export function useDeleteNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => notificationsService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: notificationsKeys.all,
			});
		},
	});
}
