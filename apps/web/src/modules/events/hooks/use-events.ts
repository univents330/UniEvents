"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateEventInput,
	CreateEventTicketTierInput,
	UpdateEventInput,
	UpdateEventTicketTierInput,
} from "@unievent/schema";
import {
	type EventListQuery,
	type EventTicketTierListQuery,
	eventsService,
} from "../services/events.service";

const eventsKeys = {
	all: ["events"] as const,
	lists: () => [...eventsKeys.all, "list"] as const,
	list: (query?: EventListQuery) =>
		[...eventsKeys.lists(), query ?? {}] as const,
	details: () => [...eventsKeys.all, "detail"] as const,
	detail: (eventId: string) => [...eventsKeys.details(), eventId] as const,
	slug: (slug: string) => [...eventsKeys.all, "slug", slug] as const,
	ticketTierLists: () => [...eventsKeys.all, "ticket-tiers"] as const,
	ticketTierList: (eventId: string, query?: EventTicketTierListQuery) =>
		[...eventsKeys.ticketTierLists(), eventId, query ?? {}] as const,
	ticketTier: (eventId: string, tierId: string) =>
		[...eventsKeys.ticketTierLists(), eventId, tierId] as const,
};

export function useEvents(query?: EventListQuery) {
	return useQuery({
		queryKey: eventsKeys.list(query),
		queryFn: () => eventsService.list(query),
	});
}

export function useEvent(eventId?: string) {
	return useQuery({
		queryKey: eventsKeys.detail(eventId ?? ""),
		queryFn: () => eventsService.getById(eventId as string),
		enabled: Boolean(eventId),
	});
}

export function useEventBySlug(slug?: string) {
	return useQuery({
		queryKey: eventsKeys.slug(slug ?? ""),
		queryFn: () => eventsService.getBySlug(slug as string),
		enabled: Boolean(slug),
	});
}

export function useEventTicketTiers(
	eventId?: string,
	query?: EventTicketTierListQuery,
) {
	return useQuery({
		queryKey: eventsKeys.ticketTierList(eventId ?? "", query),
		queryFn: () => eventsService.listTicketTiers(eventId as string, query),
		enabled: Boolean(eventId),
	});
}

export function useEventTicketTier(eventId?: string, tierId?: string) {
	return useQuery({
		queryKey: eventsKeys.ticketTier(eventId ?? "", tierId ?? ""),
		queryFn: () =>
			eventsService.getTicketTierById(eventId as string, tierId as string),
		enabled: Boolean(eventId && tierId),
	});
}

export function useCreateEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateEventInput) => eventsService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventsKeys.all });
		},
	});
}

export function useUpdateEvent(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateEventInput) =>
			eventsService.update(eventId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventsKeys.all });
			queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}

export function useDeleteEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventId: string) => eventsService.remove(eventId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: eventsKeys.all });
		},
	});
}

export function useCreateEventTicketTier(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateEventTicketTierInput) =>
			eventsService.createTicketTier(eventId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: eventsKeys.ticketTierList(eventId),
			});
			queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}

export function useUpdateEventTicketTier(eventId: string, tierId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateEventTicketTierInput) =>
			eventsService.updateTicketTier(eventId, tierId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: eventsKeys.ticketTierList(eventId),
			});
			queryClient.invalidateQueries({
				queryKey: eventsKeys.ticketTier(eventId, tierId),
			});
		},
	});
}

export function useDeleteEventTicketTier(eventId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tierId: string) =>
			eventsService.deleteTicketTier(eventId, tierId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: eventsKeys.ticketTierList(eventId),
			});
			queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
		},
	});
}
