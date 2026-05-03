import type {
	ConfirmFreeOrderInput,
	GuestCheckoutInput,
	GuestCheckoutResponse,
	GuestVerifyPaymentInput,
	GuestVerifyPaymentResponse,
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
	order?: {
		id: string;
		attendeeId: string;
		eventId: string;
		status: string;
		totalAmount: number;
		createdAt: string;
		updatedAt: string;
		event?: {
			id: string;
			name: string;
			startDate?: string | Date;
			endDate?: string | Date;
			startTime?: string;
			endTime?: string;
		};
		attendee?: {
			id: string;
			name: string;
			email: string;
		};
		tickets?: Array<{
			id: string;
			tier?: {
				id: string;
				name: string;
			};
			pass?: {
				id: string;
				code: string;
				status: string;
			};
		}>;
	};
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

	// Guest checkout methods (no auth required)
	async guestCheckout(input: GuestCheckoutInput) {
		const response = await apiClient.post<GuestCheckoutResponse>(
			"/guest-checkout/initiate",
			input,
		);
		return response.data;
	},

	async guestVerifyPayment(input: GuestVerifyPaymentInput) {
		const response = await apiClient.post<GuestVerifyPaymentResponse>(
			"/guest-checkout/verify",
			input,
		);
		return response.data;
	},

	async guestGetPayment(id: string) {
		const response = await apiClient.get<PaymentRecord>(
			`/guest-checkout/payments/${id}`,
		);
		return response.data;
	},
};
