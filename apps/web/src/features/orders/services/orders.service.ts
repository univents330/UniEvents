import type {
	CreateOrderInput,
	Order,
	OrderFilterInput,
	UpdateOrderInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types";

export const ordersService = {
	/**
	 * Get all orders with optional filters
	 */
	async getOrders(params?: OrderFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Order>>("/orders", {
			params,
		});
		return response.data;
	},

	/**
	 * Get orders for a specific event
	 */
	async getEventOrders(eventId: string, params?: OrderFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Order>>("/orders", {
			params: { ...params, eventId },
		});
		return response.data;
	},

	/**
	 * Get orders for a specific attendee
	 */
	async getAttendeeOrders(attendeeId: string, params?: OrderFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Order>>("/orders", {
			params: { ...params, attendeeId },
		});
		return response.data;
	},

	/**
	 * Get a single order by ID
	 */
	async getOrder(id: string) {
		const response = await apiClient.get<Order>(`/orders/${id}`);
		return response.data;
	},

	/**
	 * Create a new order
	 */
	async createOrder(data: CreateOrderInput) {
		const response = await apiClient.post<Order>("/orders", data);
		return response.data;
	},

	/**
	 * Update an existing order
	 */
	async updateOrder(id: string, data: UpdateOrderInput) {
		const response = await apiClient.patch<Order>(`/orders/${id}`, data);
		return response.data;
	},

	/**
	 * Delete an order
	 */
	async deleteOrder(id: string): Promise<void> {
		await apiClient.delete(`/orders/${id}`);
	},
};
