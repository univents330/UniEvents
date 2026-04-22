import type {
	CheckIn,
	CheckInFilterInput,
	CreateCheckInInput,
	PaginatedResponse,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type CheckInListQuery = Partial<CheckInFilterInput>;

type CheckInRecord = Omit<CheckIn, "timestamp"> & {
	timestamp: string;
};

type CheckInListResponse = PaginatedResponse<CheckInRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export type { CheckInRecord };

export const checkInsService = {
	async list(query?: CheckInListQuery) {
		const response = await apiClient.get<CheckInListResponse>("/check-ins", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(id: string) {
		const response = await apiClient.get<CheckInRecord>(`/check-ins/${id}`);
		return response.data;
	},

	async create(input: CreateCheckInInput) {
		const response = await apiClient.post<CheckInRecord>("/check-ins", input);
		return response.data;
	},

	async remove(id: string) {
		await apiClient.delete(`/check-ins/${id}`);
	},
};
