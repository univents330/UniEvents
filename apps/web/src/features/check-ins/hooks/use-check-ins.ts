"use client";

import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheckInFilterInput, CreateCheckInInput } from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { checkInsService } from "../services/check-ins.service";

const CHECKINS_KEYS = {
	all: ["check-ins"] as const,
	lists: () => [...CHECKINS_KEYS.all, "list"] as const,
	list: (filters?: CheckInFilterInput) =>
		[...CHECKINS_KEYS.lists(), filters] as const,
	details: () => [...CHECKINS_KEYS.all, "detail"] as const,
	detail: (id: string) => [...CHECKINS_KEYS.details(), id] as const,
	eventCheckIns: (eventId: string, filters?: CheckInFilterInput) =>
		[...CHECKINS_KEYS.all, "event", eventId, filters] as const,
	attendeeCheckIns: (attendeeId: string, filters?: CheckInFilterInput) =>
		[...CHECKINS_KEYS.all, "attendee", attendeeId, filters] as const,
};

/**
 * Hook to get all check-ins
 */
export function useCheckIns(params?: CheckInFilterInput) {
	return useQuery({
		queryKey: CHECKINS_KEYS.list(params),
		queryFn: () => checkInsService.getCheckIns(params),
	});
}

/**
 * Hook to get check-ins for a specific event
 */
export function useEventCheckIns(eventId: string, params?: CheckInFilterInput) {
	return useQuery({
		queryKey: CHECKINS_KEYS.eventCheckIns(eventId, params),
		queryFn: () => checkInsService.getEventCheckIns(eventId, params),
		enabled: !!eventId,
	});
}

/**
 * Hook to get check-ins for a specific attendee
 */
export function useAttendeeCheckIns(
	attendeeId: string,
	params?: CheckInFilterInput,
) {
	return useQuery({
		queryKey: CHECKINS_KEYS.attendeeCheckIns(attendeeId, params),
		queryFn: () => checkInsService.getAttendeeCheckIns(attendeeId, params),
		enabled: !!attendeeId,
	});
}

/**
 * Hook to get a single check-in
 */
export function useCheckIn(id: string) {
	return useQuery({
		queryKey: CHECKINS_KEYS.detail(id),
		queryFn: () => checkInsService.getCheckIn(id),
		enabled: !!id,
	});
}

/**
 * Hook to create a check-in
 */
export function useCreateCheckIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCheckInInput) =>
			checkInsService.createCheckIn(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CHECKINS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: CHECKINS_KEYS.all });
			notifications.show({
				title: "Success",
				message: "Check-in created successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create check-in"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete a check-in
 */
export function useDeleteCheckIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => checkInsService.deleteCheckIn(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CHECKINS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: CHECKINS_KEYS.all });
			notifications.show({
				title: "Success",
				message: "Check-in deleted successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete check-in"),
				color: "red",
			});
		},
	});
}
