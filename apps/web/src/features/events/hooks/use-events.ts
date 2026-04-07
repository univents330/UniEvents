"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateEventTicketTierInput,
	EventFilterInput,
	UpdateEventInput,
	UpdateEventTicketTierInput,
} from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { showNotification } from "@/shared/lib/notifications";
import { eventsService } from "../services";

const EVENTS_KEYS = {
	all: ["events"] as const,
	lists: () => [...EVENTS_KEYS.all, "list"] as const,
	list: (params?: EventFilterInput) =>
		[...EVENTS_KEYS.lists(), params] as const,
	details: () => [...EVENTS_KEYS.all, "detail"] as const,
	detail: (id: string) => [...EVENTS_KEYS.details(), id] as const,
	tiers: (eventId: string) =>
		[...EVENTS_KEYS.detail(eventId), "tiers"] as const,
};

import { MOCK_EVENTS } from "../constants/mock-events";


export function useEvents(params?: EventFilterInput) {
	return useQuery({
		queryKey: EVENTS_KEYS.list(params),
		queryFn: async () => {
			try {
				const response = await eventsService.getEvents(params);
				if (!response.data || response.data.length === 0) {
					return {
						data: MOCK_EVENTS,
						meta: { total: MOCK_EVENTS.length, page: 1, limit: 100 },
					};
				}
				return response;
			} catch (error) {
				console.error("Failed to fetch events, falling back to mock:", error);
				return {
					data: MOCK_EVENTS,
					meta: { total: MOCK_EVENTS.length, page: 1, limit: 100 },
				};
			}
		},
	});
}

/**
 * Hook to fetch a single event
 */
export function useEvent(id: string) {
	return useQuery({
		queryKey: EVENTS_KEYS.detail(id),
		queryFn: () => eventsService.getEvent(id),
		enabled: !!id,
	});
}

/**
 * Hook to create an event
 */
export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: eventsService.createEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
			showNotification({
				title: "Event created",
				message: "Your event has been created successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create event"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update an event
 */
export function useUpdateEvent(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateEventInput) => eventsService.updateEvent(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.detail(id) });
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
			showNotification({
				title: "Event updated",
				message: "Your event has been updated successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update event"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: eventsService.deleteEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.details() });
			showNotification({
				title: "Event deleted",
				message: "Event has been deleted successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete event"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to fetch ticket tiers for an event
 */
export function useTicketTiers(eventId: string) {
	return useQuery({
		queryKey: EVENTS_KEYS.tiers(eventId),
		queryFn: () => eventsService.getTicketTiers(eventId),
		enabled: !!eventId,
	});
}

/**
 * Hook to create a ticket tier
 */
export function useCreateTicketTier(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEventTicketTierInput) =>
			eventsService.createTicketTier(eventId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.tiers(eventId) });
			showNotification({
				title: "Ticket tier created",
				message: "Ticket tier has been created successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create ticket tier"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update a ticket tier
 */
export function useUpdateTicketTier(eventId: string, tierId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateEventTicketTierInput) =>
			eventsService.updateTicketTier(eventId, tierId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.tiers(eventId) });
			showNotification({
				title: "Ticket tier updated",
				message: "Ticket tier has been updated successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update ticket tier"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete a ticket tier
 */
export function useDeleteTicketTier(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tierId: string) =>
			eventsService.deleteTicketTier(eventId, tierId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.tiers(eventId) });
			showNotification({
				title: "Ticket tier deleted",
				message: "Ticket tier has been deleted successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete ticket tier"),
				color: "red",
			});
		},
	});
}
