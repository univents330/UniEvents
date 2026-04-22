import type {
	ConfirmFreeOrderInput,
	InitiatePaymentInput,
	InitiatePaymentResponse,
	PaginatedResponse,
	Payment,
	PaymentFilterInput,
	RefundPaymentInput,
	UpdatePaymentInput,
	VerifyPaymentInput,
	VerifyPaymentResponse,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type PaymentListQuery = Partial<PaymentFilterInput>;

type PaymentRecord = Omit<Payment, "createdAt" | "updatedAt" | "deletedAt"> & {
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

type PaymentListResponse = PaginatedResponse<PaymentRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export type { PaymentRecord };

export const paymentsService = {
	async list(query?: PaymentListQuery) {
		const response = await apiClient.get<PaymentListResponse>("/payments", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(id: string) {
		const response = await apiClient.get<PaymentRecord>(`/payments/${id}`);
		return response.data;
	},

	async initiate(input: InitiatePaymentInput) {
		const response = await apiClient.post<InitiatePaymentResponse>(
			"/payments/initiate",
			input,
		);
		return response.data;
	},

	async confirmFreeOrder(input: ConfirmFreeOrderInput) {
		const response = await apiClient.post<PaymentRecord>(
			"/payments/free-confirm",
			input,
		);
		return response.data;
	},

	async verify(input: VerifyPaymentInput) {
		const response = await apiClient.post<VerifyPaymentResponse>(
			"/payments/verify",
			input,
		);
		return response.data;
	},

	async refund(id: string, input: RefundPaymentInput) {
		const response = await apiClient.post<PaymentRecord>(
			`/payments/${id}/refund`,
			input,
		);
		return response.data;
	},

	async update(id: string, input: UpdatePaymentInput) {
		const response = await apiClient.patch<PaymentRecord>(
			`/payments/${id}`,
			input,
		);
		return response.data;
	},

	async remove(id: string) {
		await apiClient.delete(`/payments/${id}`);
	},
};
