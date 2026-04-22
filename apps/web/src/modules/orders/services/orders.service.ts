import type {
	CreateOrderInput,
	Order,
	OrderFilterInput,
	PaginatedResponse,
	UpdateOrderInput,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type OrderListQuery = Partial<OrderFilterInput>;

type OrderRecord = Omit<Order, "createdAt" | "updatedAt" | "deletedAt"> & {
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

type OrderListResponse = PaginatedResponse<OrderRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export type { OrderRecord };

export const ordersService = {
	async list(query?: OrderListQuery) {
		const response = await apiClient.get<OrderListResponse>("/orders", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(id: string) {
		const response = await apiClient.get<OrderRecord>(`/orders/${id}`);
		return response.data;
	},

	async create(input: CreateOrderInput) {
		const response = await apiClient.post<OrderRecord>("/orders", input);
		return response.data;
	},

	async update(id: string, input: UpdateOrderInput) {
		const response = await apiClient.patch<OrderRecord>(`/orders/${id}`, input);
		return response.data;
	},

	async remove(id: string) {
		await apiClient.delete(`/orders/${id}`);
	},
};
