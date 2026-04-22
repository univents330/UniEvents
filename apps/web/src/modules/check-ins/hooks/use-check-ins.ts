"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCheckInInput } from "@unievent/schema";
import {
	type CheckInListQuery,
	checkInsService,
} from "../services/check-ins.service";

const checkInsKeys = {
	all: ["check-ins"] as const,
	lists: () => [...checkInsKeys.all, "list"] as const,
	list: (query?: CheckInListQuery) =>
		[...checkInsKeys.lists(), query ?? {}] as const,
	details: () => [...checkInsKeys.all, "detail"] as const,
	detail: (id: string) => [...checkInsKeys.details(), id] as const,
};

export function useCheckIns(query?: CheckInListQuery) {
	return useQuery({
		queryKey: checkInsKeys.list(query),
		queryFn: () => checkInsService.list(query),
	});
}

export function useCheckIn(id?: string) {
	return useQuery({
		queryKey: checkInsKeys.detail(id ?? ""),
		queryFn: () => checkInsService.getById(id as string),
		enabled: Boolean(id),
	});
}

export function useCreateCheckIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCheckInInput) => checkInsService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: checkInsKeys.all });
		},
	});
}

export function useDeleteCheckIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => checkInsService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: checkInsKeys.all });
		},
	});
}
