"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreatePassInput,
	UpdatePassInput,
	ValidatePassInput,
} from "@unievent/schema";
import { type PassListQuery, passesService } from "../services/passes.service";

const passesKeys = {
	all: ["passes"] as const,
	lists: () => [...passesKeys.all, "list"] as const,
	list: (query?: PassListQuery) =>
		[...passesKeys.lists(), query ?? {}] as const,
	details: () => [...passesKeys.all, "detail"] as const,
	detail: (id: string) => [...passesKeys.details(), id] as const,
};

export function usePasses(query?: PassListQuery) {
	return useQuery({
		queryKey: passesKeys.list(query),
		queryFn: () => passesService.list(query),
	});
}

export function usePass(id?: string) {
	return useQuery({
		queryKey: passesKeys.detail(id ?? ""),
		queryFn: () => passesService.getById(id as string),
		enabled: Boolean(id),
	});
}

export function useCreatePass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreatePassInput) => passesService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: passesKeys.all });
		},
	});
}

export function useUpdatePass(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdatePassInput) => passesService.update(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: passesKeys.all });
			queryClient.invalidateQueries({ queryKey: passesKeys.detail(id) });
		},
	});
}

export function useDeletePass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => passesService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: passesKeys.all });
		},
	});
}

export function useValidatePass() {
	return useMutation({
		mutationFn: (input: ValidatePassInput) => passesService.validate(input),
	});
}
