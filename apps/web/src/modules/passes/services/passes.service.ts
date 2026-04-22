import type {
	CreatePassInput,
	PaginatedResponse,
	Pass,
	PassFilterInput,
	UpdatePassInput,
	ValidatePassInput,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type PassListQuery = Partial<PassFilterInput>;

type PassRecord = Omit<Pass, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
};

type PassListResponse = PaginatedResponse<PassRecord>;

type PassValidationResult = {
	valid: boolean;
	pass?: PassRecord;
	message: string;
};

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export type { PassRecord };

export const passesService = {
	async list(query?: PassListQuery) {
		const response = await apiClient.get<PassListResponse>("/passes", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(id: string) {
		const response = await apiClient.get<PassRecord>(`/passes/${id}`);
		return response.data;
	},

	async create(input: CreatePassInput) {
		const response = await apiClient.post<PassRecord>("/passes", input);
		return response.data;
	},

	async update(id: string, input: UpdatePassInput) {
		const response = await apiClient.patch<PassRecord>(`/passes/${id}`, input);
		return response.data;
	},

	async remove(id: string) {
		await apiClient.delete(`/passes/${id}`);
	},

	async validate(input: ValidatePassInput) {
		const response = await apiClient.post<PassValidationResult>(
			"/passes/validate",
			input,
		);
		return response.data;
	},
};
