import type {
	CreateNotificationInput,
	NotificationFilterInput,
	PaginatedResponse,
	UpdateNotificationInput,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type NotificationListQuery = Partial<NotificationFilterInput>;

type NotificationRecord = {
	id: string;
	type: string;
	title: string;
	message: string;
	userId: string | null;
	eventId: string | null;
	orderId: string | null;
	status: string;
	readAt: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
};

type NotificationListResponse = PaginatedResponse<NotificationRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export type { NotificationRecord };

export const notificationsService = {
	async list(query?: NotificationListQuery) {
		const response = await apiClient.get<NotificationListResponse>(
			"/notifications",
			{
				params: serializeQuery(query as Record<string, QueryValue> | undefined),
			},
		);
		return response.data;
	},

	async getById(id: string) {
		const response = await apiClient.get<NotificationRecord>(
			`/notifications/${id}`,
		);
		return response.data;
	},

	async getUnreadCount() {
		const response = await apiClient.get<{ count: number }>(
			"/notifications/unread-count",
		);
		return response.data;
	},

	async create(input: CreateNotificationInput) {
		const response = await apiClient.post<NotificationRecord>(
			"/notifications",
			input,
		);
		return response.data;
	},

	async update(id: string, input: UpdateNotificationInput) {
		const response = await apiClient.patch<NotificationRecord>(
			`/notifications/${id}`,
			input,
		);
		return response.data;
	},

	async markAllAsRead(userId: string) {
		const response = await apiClient.post<{ updated: number }>(
			"/notifications/mark-all-read",
			{ userId },
		);
		return response.data;
	},

	async remove(id: string) {
		await apiClient.delete(`/notifications/${id}`);
	},
};
