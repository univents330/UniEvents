"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type DashboardAnalyticsQuery,
	dashboardAnalyticsService,
} from "../services/dashboard-analytics.service";

const dashboardAnalyticsKeys = {
	all: ["dashboard", "analytics"] as const,
	event: (eventId: string) =>
		[...dashboardAnalyticsKeys.all, "event", eventId] as const,
	revenue: (query?: DashboardAnalyticsQuery) =>
		[...dashboardAnalyticsKeys.all, "revenue", query ?? {}] as const,
	attendees: (query?: DashboardAnalyticsQuery) =>
		[...dashboardAnalyticsKeys.all, "attendees", query ?? {}] as const,
};

export function useEventAnalytics(eventId?: string) {
	return useQuery({
		queryKey: dashboardAnalyticsKeys.event(eventId ?? ""),
		queryFn: () =>
			dashboardAnalyticsService.getEventAnalytics(eventId as string),
		enabled: Boolean(eventId),
	});
}

export function useRevenueAnalytics(query?: DashboardAnalyticsQuery) {
	return useQuery({
		queryKey: dashboardAnalyticsKeys.revenue(query),
		queryFn: () => dashboardAnalyticsService.getRevenueAnalytics(query),
	});
}

export function useAttendeeAnalytics(query?: DashboardAnalyticsQuery) {
	return useQuery({
		queryKey: dashboardAnalyticsKeys.attendees(query),
		queryFn: () => dashboardAnalyticsService.getAttendeeAnalytics(query),
	});
}

export function useDashboardAnalytics(query?: DashboardAnalyticsQuery) {
	const revenueQuery = useRevenueAnalytics(query);
	const attendeesQuery = useAttendeeAnalytics(query);

	return {
		revenueQuery,
		attendeesQuery,
		isLoading: revenueQuery.isLoading || attendeesQuery.isLoading,
	};
}
