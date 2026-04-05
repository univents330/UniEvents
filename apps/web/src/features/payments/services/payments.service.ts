import type {
	InitiatePaymentInput,
	Payment,
	PaymentFilterInput,
	RefundPaymentInput,
	UpdatePaymentInput,
	VerifyPaymentInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type {
	InitiatePaymentResponse,
	PaginatedResponse,
	VerifyPaymentResponse,
} from "@/shared/types";

export const paymentsService = {
	/**
	 * Get all payments with optional filters
	 */
	async getPayments(params?: PaymentFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Payment>>(
			"/payments",
			{ params },
		);
		return response.data;
	},

	/**
	 * Get payments for a specific order
	 */
	async getOrderPayments(orderId: string, params?: PaymentFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Payment>>(
			"/payments",
			{
				params: { ...params, orderId },
			},
		);
		return response.data;
	},

	/**
	 * Get a single payment by ID
	 */
	async getPayment(id: string) {
		const response = await apiClient.get<Payment>(`/payments/${id}`);
		return response.data;
	},

	/**
	 * Initiate payment with Razorpay
	 */
	async initiatePayment(data: InitiatePaymentInput) {
		const response = await apiClient.post<InitiatePaymentResponse>(
			"/payments/initiate",
			data,
		);
		return response.data;
	},

	/**
	 * Verify payment from Razorpay
	 */
	async verifyPayment(data: VerifyPaymentInput) {
		const response = await apiClient.post<VerifyPaymentResponse>(
			"/payments/verify",
			data,
		);
		return response.data;
	},

	/**
	 * Refund a payment
	 */
	async refundPayment(id: string, data?: RefundPaymentInput) {
		const response = await apiClient.post<Payment>(
			`/payments/${id}/refund`,
			data,
		);
		return response.data;
	},

	/**
	 * Update an existing payment
	 */
	async updatePayment(id: string, data: UpdatePaymentInput) {
		const response = await apiClient.patch<Payment>(`/payments/${id}`, data);
		return response.data;
	},

	/**
	 * Delete a payment
	 */
	async deletePayment(id: string): Promise<void> {
		await apiClient.delete(`/payments/${id}`);
	},
};
