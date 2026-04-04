"use client";

import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateTicketInput,
	TicketFilterInput,
	UpdateTicketInput,
} from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { ticketsService } from "../services/tickets.service";

const TICKETS_KEYS = {
	all: ["tickets"] as const,
	lists: () => [...TICKETS_KEYS.all, "list"] as const,
	list: (filters?: TicketFilterInput) =>
		[...TICKETS_KEYS.lists(), filters] as const,
	details: () => [...TICKETS_KEYS.all, "detail"] as const,
	detail: (id: string) => [...TICKETS_KEYS.details(), id] as const,
	orderTickets: (orderId: string, filters?: TicketFilterInput) =>
		[...TICKETS_KEYS.all, "order", orderId, filters] as const,
	eventTickets: (eventId: string, filters?: TicketFilterInput) =>
		[...TICKETS_KEYS.all, "event", eventId, filters] as const,
};

/**
 * Hook to get all tickets
 */
export function useTickets(params?: TicketFilterInput) {
	return useQuery({
		queryKey: TICKETS_KEYS.list(params),
		queryFn: () => ticketsService.getTickets(params),
	});
}

/**
 * Hook to get tickets for a specific order
 */
export function useOrderTickets(orderId: string, params?: TicketFilterInput) {
	return useQuery({
		queryKey: TICKETS_KEYS.orderTickets(orderId, params),
		queryFn: () => ticketsService.getOrderTickets(orderId, params),
		enabled: !!orderId,
	});
}

/**
 * Hook to get tickets for a specific event
 */
export function useEventTickets(eventId: string, params?: TicketFilterInput) {
	return useQuery({
		queryKey: TICKETS_KEYS.eventTickets(eventId, params),
		queryFn: () => ticketsService.getEventTickets(eventId, params),
		enabled: !!eventId,
	});
}

/**
 * Hook to get a single ticket
 */
export function useTicket(id: string) {
	return useQuery({
		queryKey: TICKETS_KEYS.detail(id),
		queryFn: () => ticketsService.getTicket(id),
		enabled: !!id,
	});
}

/**
 * Hook to create a ticket
 */
export function useCreateTicket() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTicketInput) => ticketsService.createTicket(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TICKETS_KEYS.lists() });
			notifications.show({
				title: "Success",
				message: "Ticket created successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create ticket"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update a ticket
 */
export function useUpdateTicket(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateTicketInput) =>
			ticketsService.updateTicket(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TICKETS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: TICKETS_KEYS.detail(id) });
			notifications.show({
				title: "Success",
				message: "Ticket updated successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update ticket"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete a ticket
 */
export function useDeleteTicket() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => ticketsService.deleteTicket(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TICKETS_KEYS.lists() });
			notifications.show({
				title: "Success",
				message: "Ticket deleted successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete ticket"),
				color: "red",
			});
		},
	});
}
