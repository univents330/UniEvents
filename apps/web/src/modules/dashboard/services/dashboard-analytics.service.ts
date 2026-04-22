import type {
	AnalyticsFilterInput,
	AttendeeAnalytics,
	EventAnalytics,
	RevenueAnalytics,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type DashboardAnalyticsQuery = Partial<AnalyticsFilterInput>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export const dashboardAnalyticsService = {
	async getEventAnalytics(eventId: string) {
		const response = await apiClient.get<EventAnalytics>(
			`/analytics/events/${eventId}`,
		);
		return response.data;
	},

	async getRevenueAnalytics(query?: DashboardAnalyticsQuery) {
		const response = await apiClient.get<RevenueAnalytics>(
			"/analytics/revenue",
			{
				params: serializeQuery(query as Record<string, QueryValue> | undefined),
			},
		);
		return response.data;
	},

	async getAttendeeAnalytics(query?: DashboardAnalyticsQuery) {
		const response = await apiClient.get<AttendeeAnalytics>(
			"/analytics/attendees",
			{
				params: serializeQuery(query as Record<string, QueryValue> | undefined),
			},
		);
		return response.data;
	},
};
