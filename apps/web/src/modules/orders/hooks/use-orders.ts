"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput, UpdateOrderInput } from "@unievent/schema";
import { type OrderListQuery, ordersService } from "../services/orders.service";

const ordersKeys = {
	all: ["orders"] as const,
	lists: () => [...ordersKeys.all, "list"] as const,
	list: (query?: OrderListQuery) =>
		[...ordersKeys.lists(), query ?? {}] as const,
	details: () => [...ordersKeys.all, "detail"] as const,
	detail: (id: string) => [...ordersKeys.details(), id] as const,
};

export function useOrders(query?: OrderListQuery) {
	return useQuery({
		queryKey: ordersKeys.list(query),
		queryFn: () => ordersService.list(query),
	});
}

export function useOrder(id?: string) {
	return useQuery({
		queryKey: ordersKeys.detail(id ?? ""),
		queryFn: () => ordersService.getById(id as string),
		enabled: Boolean(id),
	});
}

export function useCreateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateOrderInput) => ordersService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ordersKeys.all });
		},
	});
}

export function useUpdateOrder(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateOrderInput) => ordersService.update(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ordersKeys.all });
			queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
		},
	});
}

export function useDeleteOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => ordersService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ordersKeys.all });
		},
	});
}
