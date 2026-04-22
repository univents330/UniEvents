"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTicketInput, UpdateTicketInput } from "@unievent/schema";
import {
	type TicketListQuery,
	ticketsService,
} from "../services/tickets.service";

const ticketsKeys = {
	all: ["tickets"] as const,
	lists: () => [...ticketsKeys.all, "list"] as const,
	list: (query?: TicketListQuery) =>
		[...ticketsKeys.lists(), query ?? {}] as const,
	details: () => [...ticketsKeys.all, "detail"] as const,
	detail: (ticketId: string) => [...ticketsKeys.details(), ticketId] as const,
};

export function useTickets(query?: TicketListQuery) {
	return useQuery({
		queryKey: ticketsKeys.list(query),
		queryFn: () => ticketsService.list(query),
	});
}

export function useTicket(ticketId?: string) {
	return useQuery({
		queryKey: ticketsKeys.detail(ticketId ?? ""),
		queryFn: () => ticketsService.getById(ticketId as string),
		enabled: Boolean(ticketId),
	});
}

export function useCreateTicket() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTicketInput) => ticketsService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
		},
	});
}

export function useUpdateTicket(ticketId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateTicketInput) =>
			ticketsService.update(ticketId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
			queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(ticketId) });
		},
	});
}

export function useDeleteTicket() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (ticketId: string) => ticketsService.remove(ticketId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
		},
	});
}
