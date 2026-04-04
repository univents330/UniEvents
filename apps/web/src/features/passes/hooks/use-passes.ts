"use client";

import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreatePassInput,
	PassFilterInput,
	UpdatePassInput,
	ValidatePassInput,
} from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { passesService } from "../services/passes.service";

const PASSES_KEYS = {
	all: ["passes"] as const,
	lists: () => [...PASSES_KEYS.all, "list"] as const,
	list: (filters?: PassFilterInput) =>
		[...PASSES_KEYS.lists(), filters] as const,
	details: () => [...PASSES_KEYS.all, "detail"] as const,
	detail: (id: string) => [...PASSES_KEYS.details(), id] as const,
	eventPasses: (eventId: string, filters?: PassFilterInput) =>
		[...PASSES_KEYS.all, "event", eventId, filters] as const,
	attendeePasses: (attendeeId: string, filters?: PassFilterInput) =>
		[...PASSES_KEYS.all, "attendee", attendeeId, filters] as const,
};

/**
 * Hook to get all passes
 */
export function usePasses(params?: PassFilterInput) {
	return useQuery({
		queryKey: PASSES_KEYS.list(params),
		queryFn: () => passesService.getPasses(params),
	});
}

/**
 * Hook to get passes for a specific event
 */
export function useEventPasses(eventId: string, params?: PassFilterInput) {
	return useQuery({
		queryKey: PASSES_KEYS.eventPasses(eventId, params),
		queryFn: () => passesService.getEventPasses(eventId, params),
		enabled: !!eventId,
	});
}

/**
 * Hook to get passes for a specific attendee
 */
export function useAttendeePasses(
	attendeeId: string,
	params?: PassFilterInput,
) {
	return useQuery({
		queryKey: PASSES_KEYS.attendeePasses(attendeeId, params),
		queryFn: () => passesService.getAttendeePasses(attendeeId, params),
		enabled: !!attendeeId,
	});
}

/**
 * Hook to get a single pass
 */
export function usePass(id: string) {
	return useQuery({
		queryKey: PASSES_KEYS.detail(id),
		queryFn: () => passesService.getPass(id),
		enabled: !!id,
	});
}

/**
 * Hook to create a pass
 */
export function useCreatePass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreatePassInput) => passesService.createPass(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PASSES_KEYS.lists() });
			notifications.show({
				title: "Success",
				message: "Pass created successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create pass"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to validate a pass
 */
export function useValidatePass() {
	return useMutation({
		mutationFn: (data: ValidatePassInput) => passesService.validatePass(data),
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to validate pass"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update a pass
 */
export function useUpdatePass(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdatePassInput) => passesService.updatePass(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PASSES_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: PASSES_KEYS.detail(id) });
			notifications.show({
				title: "Success",
				message: "Pass updated successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update pass"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete a pass
 */
export function useDeletePass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => passesService.deletePass(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PASSES_KEYS.lists() });
			notifications.show({
				title: "Success",
				message: "Pass deleted successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete pass"),
				color: "red",
			});
		},
	});
}
