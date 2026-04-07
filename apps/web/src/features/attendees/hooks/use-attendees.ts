"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	AttendeeFilterInput,
	CreateAttendeeInput,
	UpdateAttendeeInput,
} from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { showNotification } from "@/shared/lib/notifications";
import { attendeesService } from "../services/attendees.service";

const ATTENDEES_KEYS = {
	all: ["attendees"] as const,
	lists: () => [...ATTENDEES_KEYS.all, "list"] as const,
	list: (filters?: AttendeeFilterInput) =>
		[...ATTENDEES_KEYS.lists(), filters] as const,
	details: () => [...ATTENDEES_KEYS.all, "detail"] as const,
	detail: (id: string) => [...ATTENDEES_KEYS.details(), id] as const,
	eventAttendees: (eventId: string, filters?: AttendeeFilterInput) =>
		[...ATTENDEES_KEYS.all, "event", eventId, filters] as const,
};

/**
 * Hook to get all attendees
 */
export function useAttendees(params?: AttendeeFilterInput) {
	return useQuery({
		queryKey: ATTENDEES_KEYS.list(params),
		queryFn: () => attendeesService.getAttendees(params),
	});
}

/**
 * Hook to get attendees for a specific event
 */
export function useEventAttendees(
	eventId: string,
	params?: AttendeeFilterInput,
) {
	return useQuery({
		queryKey: ATTENDEES_KEYS.eventAttendees(eventId, params),
		queryFn: () => attendeesService.getEventAttendees(eventId, params),
		enabled: !!eventId,
	});
}

/**
 * Hook to get a single attendee
 */
export function useAttendee(id: string) {
	return useQuery({
		queryKey: ATTENDEES_KEYS.detail(id),
		queryFn: () => attendeesService.getAttendee(id),
		enabled: !!id,
	});
}

/**
 * Hook to create an attendee
 */
export function useCreateAttendee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAttendeeInput) =>
			attendeesService.createAttendee(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ATTENDEES_KEYS.lists() });
			showNotification({
				title: "Success",
				message: "Attendee created successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create attendee"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update an attendee
 */
export function useUpdateAttendee(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateAttendeeInput) =>
			attendeesService.updateAttendee(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ATTENDEES_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: ATTENDEES_KEYS.detail(id) });
			showNotification({
				title: "Success",
				message: "Attendee updated successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update attendee"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete an attendee
 */
export function useDeleteAttendee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => attendeesService.deleteAttendee(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ATTENDEES_KEYS.lists() });
			showNotification({
				title: "Success",
				message: "Attendee deleted successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete attendee"),
				color: "red",
			});
		},
	});
}
