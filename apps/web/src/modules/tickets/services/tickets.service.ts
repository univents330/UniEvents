import type {
	CreateTicketInput,
	PaginatedResponse,
	TicketFilterInput,
	TicketRecord,
	UpdateTicketInput,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type TicketListQuery = Partial<TicketFilterInput>;

type TicketListResponse = PaginatedResponse<TicketRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export const ticketsService = {
	async list(query?: TicketListQuery) {
		const response = await apiClient.get<TicketListResponse>("/tickets", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(ticketId: string) {
		const response = await apiClient.get<TicketRecord>(`/tickets/${ticketId}`);
		return response.data;
	},

	async create(input: CreateTicketInput) {
		const response = await apiClient.post<TicketRecord>("/tickets", input);
		return response.data;
	},

	async update(ticketId: string, input: UpdateTicketInput) {
		const response = await apiClient.patch<TicketRecord>(
			`/tickets/${ticketId}`,
			input,
		);
		return response.data;
	},

	async remove(ticketId: string) {
		await apiClient.delete(`/tickets/${ticketId}`);
	},
};
