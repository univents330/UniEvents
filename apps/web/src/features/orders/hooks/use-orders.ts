"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateOrderInput,
	OrderFilterInput,
	UpdateOrderInput,
} from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { showNotification } from "@/shared/lib/notifications";
import { ordersService } from "../services/orders.service";

const ORDERS_KEYS = {
	all: ["orders"] as const,
	lists: () => [...ORDERS_KEYS.all, "list"] as const,
	list: (filters?: OrderFilterInput) =>
		[...ORDERS_KEYS.lists(), filters] as const,
	details: () => [...ORDERS_KEYS.all, "detail"] as const,
	detail: (id: string) => [...ORDERS_KEYS.details(), id] as const,
	eventOrders: (eventId: string, filters?: OrderFilterInput) =>
		[...ORDERS_KEYS.all, "event", eventId, filters] as const,
	attendeeOrders: (attendeeId: string, filters?: OrderFilterInput) =>
		[...ORDERS_KEYS.all, "attendee", attendeeId, filters] as const,
};

/**
 * Hook to get all orders
 */
export function useOrders(params?: OrderFilterInput) {
	return useQuery({
		queryKey: ORDERS_KEYS.list(params),
		queryFn: () => ordersService.getOrders(params),
	});
}

/**
 * Hook to get orders for a specific event
 */
export function useEventOrders(eventId: string, params?: OrderFilterInput) {
	return useQuery({
		queryKey: ORDERS_KEYS.eventOrders(eventId, params),
		queryFn: () => ordersService.getEventOrders(eventId, params),
		enabled: !!eventId,
	});
}

/**
 * Hook to get orders for a specific attendee
 */
export function useAttendeeOrders(
	attendeeId: string,
	params?: OrderFilterInput,
) {
	return useQuery({
		queryKey: ORDERS_KEYS.attendeeOrders(attendeeId, params),
		queryFn: () => ordersService.getAttendeeOrders(attendeeId, params),
		enabled: !!attendeeId,
	});
}

/**
 * Hook to get a single order
 */
export function useOrder(id: string) {
	return useQuery({
		queryKey: ORDERS_KEYS.detail(id),
		queryFn: () => ordersService.getOrder(id),
		enabled: !!id,
	});
}

/**
 * Hook to create an order
 */
export function useCreateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateOrderInput) => ordersService.createOrder(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
			showNotification({
				title: "Success",
				message: "Order created successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to create order"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update an order
 */
export function useUpdateOrder(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateOrderInput) => ordersService.updateOrder(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.detail(id) });
			showNotification({
				title: "Success",
				message: "Order updated successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update order"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete an order
 */
export function useDeleteOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => ordersService.deleteOrder(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
			showNotification({
				title: "Success",
				message: "Order deleted successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete order"),
				color: "red",
			});
		},
	});
}
