"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	InitiatePaymentInput,
	PaymentFilterInput,
	RefundPaymentInput,
	UpdatePaymentInput,
	VerifyPaymentInput,
} from "@voltaze/schema";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { showNotification } from "@/shared/lib/notifications";
import { paymentsService } from "../services/payments.service";

const PAYMENTS_KEYS = {
	all: ["payments"] as const,
	lists: () => [...PAYMENTS_KEYS.all, "list"] as const,
	list: (filters?: PaymentFilterInput) =>
		[...PAYMENTS_KEYS.lists(), filters] as const,
	details: () => [...PAYMENTS_KEYS.all, "detail"] as const,
	detail: (id: string) => [...PAYMENTS_KEYS.details(), id] as const,
	orderPayments: (orderId: string, filters?: PaymentFilterInput) =>
		[...PAYMENTS_KEYS.all, "order", orderId, filters] as const,
};

/**
 * Hook to get all payments
 */
export function usePayments(params?: PaymentFilterInput) {
	return useQuery({
		queryKey: PAYMENTS_KEYS.list(params),
		queryFn: () => paymentsService.getPayments(params),
	});
}

/**
 * Hook to get payments for a specific order
 */
export function useOrderPayments(orderId: string, params?: PaymentFilterInput) {
	return useQuery({
		queryKey: PAYMENTS_KEYS.orderPayments(orderId, params),
		queryFn: () => paymentsService.getOrderPayments(orderId, params),
		enabled: !!orderId,
	});
}

/**
 * Hook to get a single payment
 */
export function usePayment(id: string) {
	return useQuery({
		queryKey: PAYMENTS_KEYS.detail(id),
		queryFn: () => paymentsService.getPayment(id),
		enabled: !!id,
	});
}

/**
 * Hook to initiate a payment with Razorpay
 */
export function useInitiatePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: InitiatePaymentInput) =>
			paymentsService.initiatePayment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.lists() });
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to initiate payment"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to verify a payment from Razorpay
 */
export function useVerifyPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: VerifyPaymentInput) =>
			paymentsService.verifyPayment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.lists() });
			showNotification({
				title: "Success",
				message: "Payment verified successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Payment verification failed"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to refund a payment
 */
export function useRefundPayment(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data?: RefundPaymentInput) =>
			paymentsService.refundPayment(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.detail(id) });
			showNotification({
				title: "Success",
				message: "Payment refunded successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to refund payment"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to update a payment
 */
export function useUpdatePayment(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdatePaymentInput) =>
			paymentsService.updatePayment(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.detail(id) });
			showNotification({
				title: "Success",
				message: "Payment updated successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to update payment"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to delete a payment
 */
export function useDeletePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => paymentsService.deletePayment(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.lists() });
			showNotification({
				title: "Success",
				message: "Payment deleted successfully",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to delete payment"),
				color: "red",
			});
		},
	});
}
