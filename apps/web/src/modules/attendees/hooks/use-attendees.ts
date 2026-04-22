"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateAttendeeInput,
	UpdateAttendeeInput,
} from "@unievent/schema";
import {
	type AttendeeListQuery,
	attendeesService,
} from "../services/attendees.service";

const attendeesKeys = {
	all: ["attendees"] as const,
	lists: () => [...attendeesKeys.all, "list"] as const,
	list: (query?: AttendeeListQuery) =>
		[...attendeesKeys.lists(), query ?? {}] as const,
	details: () => [...attendeesKeys.all, "detail"] as const,
	detail: (id: string) => [...attendeesKeys.details(), id] as const,
};

export function useAttendees(query?: AttendeeListQuery) {
	return useQuery({
		queryKey: attendeesKeys.list(query),
		queryFn: () => attendeesService.list(query),
	});
}

export function useAttendee(id?: string) {
	return useQuery({
		queryKey: attendeesKeys.detail(id ?? ""),
		queryFn: () => attendeesService.getById(id as string),
		enabled: Boolean(id),
	});
}

export function useCreateAttendee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateAttendeeInput) => attendeesService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendeesKeys.all });
		},
	});
}

export function useUpdateAttendee(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateAttendeeInput) =>
			attendeesService.update(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendeesKeys.all });
			queryClient.invalidateQueries({ queryKey: attendeesKeys.detail(id) });
		},
	});
}

export function useDeleteAttendee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => attendeesService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendeesKeys.all });
		},
	});
}
