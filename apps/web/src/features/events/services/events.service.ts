import type {
	CreateEventInput,
	CreateEventTicketTierInput,
	Event,
	EventFilterInput,
	TicketTier,
	UpdateEventInput,
	UpdateEventTicketTierInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types";

const CUID_REGEX = /^c[a-z0-9]{24}$/i;

export const eventsService = {
	/**
	 * Get all events (public)
	 */
	async getEvents(params?: EventFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Event>>("/events", {
			params,
		});
		return response.data;
	},

	/**
	 * Get a single event by ID or slug
	 */
	async getEvent(idOrSlug: string) {
		const endpoint = CUID_REGEX.test(idOrSlug)
			? `/events/${idOrSlug}`
			: `/events/slug/${encodeURIComponent(idOrSlug)}`;
		const response = await apiClient.get<Event>(endpoint);
		return response.data;
	},

	/**
	 * Create a new event (requires HOST or ADMIN role)
	 */
	async createEvent(data: CreateEventInput) {
		const response = await apiClient.post<Event>("/events", data);
		return response.data;
	},

	/**
	 * Update an event
	 */
	async updateEvent(id: string, data: UpdateEventInput) {
		const response = await apiClient.patch<Event>(`/events/${id}`, data);
		return response.data;
	},

	/**
	 * Delete an event
	 */
	async deleteEvent(id: string): Promise<void> {
		await apiClient.delete(`/events/${id}`);
	},

	/**
	 * Get ticket tiers for an event
	 */
	async getTicketTiers(eventId: string) {
		const response = await apiClient.get<PaginatedResponse<TicketTier>>(
			`/events/${eventId}/ticket-tiers`,
		);
		return response.data;
	},

	/**
	 * Create a ticket tier for an event
	 */
	async createTicketTier(eventId: string, data: CreateEventTicketTierInput) {
		const response = await apiClient.post<TicketTier>(
			`/events/${eventId}/ticket-tiers`,
			data,
		);
		return response.data;
	},

	/**
	 * Update a ticket tier
	 */
	async updateTicketTier(
		eventId: string,
		tierId: string,
		data: UpdateEventTicketTierInput,
	) {
		const response = await apiClient.patch<TicketTier>(
			`/events/${eventId}/ticket-tiers/${tierId}`,
			data,
		);
		return response.data;
	},

	/**
	 * Delete a ticket tier
	 */
	async deleteTicketTier(eventId: string, tierId: string): Promise<void> {
		await apiClient.delete(`/events/${eventId}/ticket-tiers/${tierId}`);
	},
};
