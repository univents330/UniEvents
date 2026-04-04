import type {
	CreateTicketInput,
	Ticket,
	TicketFilterInput,
	UpdateTicketInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types";

export const ticketsService = {
	/**
	 * Get all tickets with optional filters
	 */
	async getTickets(params?: TicketFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Ticket>>(
			"/tickets",
			{ params },
		);
		return response.data;
	},

	/**
	 * Get tickets for a specific order
	 */
	async getOrderTickets(orderId: string, params?: TicketFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Ticket>>(
			`/orders/${orderId}/tickets`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Get tickets for a specific event
	 */
	async getEventTickets(eventId: string, params?: TicketFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Ticket>>(
			`/events/${eventId}/tickets`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Get a single ticket by ID
	 */
	async getTicket(id: string) {
		const response = await apiClient.get<Ticket>(`/tickets/${id}`);
		return response.data;
	},

	/**
	 * Create a new ticket
	 */
	async createTicket(data: CreateTicketInput) {
		const response = await apiClient.post<Ticket>("/tickets", data);
		return response.data;
	},

	/**
	 * Update an existing ticket
	 */
	async updateTicket(id: string, data: UpdateTicketInput) {
		const response = await apiClient.patch<Ticket>(`/tickets/${id}`, data);
		return response.data;
	},

	/**
	 * Delete a ticket
	 */
	async deleteTicket(id: string): Promise<void> {
		await apiClient.delete(`/tickets/${id}`);
	},
};
