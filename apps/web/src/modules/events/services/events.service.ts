import type {
	CreateEventInput,
	CreateEventTicketTierInput,
	EventFilterInput,
	EventRecord,
	PaginatedResponse,
	TicketTierFilterInput,
	TicketTierRecord,
	UpdateEventInput,
	UpdateEventTicketTierInput,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type EventListQuery = Partial<EventFilterInput>;
export type EventTicketTierListQuery = Partial<TicketTierFilterInput>;
export type { EventRecord };

type EventListResponse = PaginatedResponse<EventRecord>;
type TicketTierListResponse = PaginatedResponse<TicketTierRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export const eventsService = {
	async list(query?: EventListQuery) {
		const response = await apiClient.get<EventListResponse>("/events", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(eventId: string) {
		const response = await apiClient.get<EventRecord>(`/events/${eventId}`);
		return response.data;
	},

	async getBySlug(slug: string) {
		const response = await apiClient.get<EventRecord>(`/events/slug/${slug}`);
		return response.data;
	},

	async create(input: CreateEventInput) {
		const response = await apiClient.post<EventRecord>("/events", input);
		return response.data;
	},

	async update(eventId: string, input: UpdateEventInput) {
		const response = await apiClient.patch<EventRecord>(
			`/events/${eventId}`,
			input,
		);
		return response.data;
	},

	async remove(eventId: string) {
		await apiClient.delete(`/events/${eventId}`);
	},

	async listTicketTiers(eventId: string, query?: EventTicketTierListQuery) {
		const response = await apiClient.get<TicketTierListResponse>(
			`/events/${eventId}/ticket-tiers`,
			{
				params: serializeQuery(query as Record<string, QueryValue> | undefined),
			},
		);
		return response.data;
	},

	async getTicketTierById(eventId: string, tierId: string) {
		const response = await apiClient.get<TicketTierRecord>(
			`/events/${eventId}/ticket-tiers/${tierId}`,
		);
		return response.data;
	},

	async createTicketTier(eventId: string, input: CreateEventTicketTierInput) {
		const response = await apiClient.post<TicketTierRecord>(
			`/events/${eventId}/ticket-tiers`,
			input,
		);
		return response.data;
	},

	async updateTicketTier(
		eventId: string,
		tierId: string,
		input: UpdateEventTicketTierInput,
	) {
		const response = await apiClient.patch<TicketTierRecord>(
			`/events/${eventId}/ticket-tiers/${tierId}`,
			input,
		);
		return response.data;
	},

	async deleteTicketTier(eventId: string, tierId: string) {
		await apiClient.delete(`/events/${eventId}/ticket-tiers/${tierId}`);
	},

	async approve(eventId: string, isApproved: boolean) {
		const response = await apiClient.patch<EventRecord>(
			`/events/${eventId}/approve`,
			{ isApproved },
		);
		return response.data;
	},
};
