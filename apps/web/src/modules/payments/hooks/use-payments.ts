"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	ConfirmFreeOrderInput,
	GuestCheckoutInput,
	GuestVerifyPaymentInput,
	InitiatePaymentInput,
	RefundPaymentInput,
	UpdatePaymentInput,
	VerifyPaymentInput,
} from "@unievent/schema";
import {
	type PaymentListQuery,
	paymentsService,
} from "../services/payments.service";

const paymentsKeys = {
	all: ["payments"] as const,
	lists: () => [...paymentsKeys.all, "list"] as const,
	list: (query?: PaymentListQuery) =>
		[...paymentsKeys.lists(), query ?? {}] as const,
	details: () => [...paymentsKeys.all, "detail"] as const,
	detail: (id: string) => [...paymentsKeys.details(), id] as const,
};

export function usePayments(query?: PaymentListQuery) {
	return useQuery({
		queryKey: paymentsKeys.list(query),
		queryFn: () => paymentsService.list(query),
	});
}

export function usePayment(id?: string) {
	return useQuery({
		queryKey: paymentsKeys.detail(id ?? ""),
		queryFn: () => paymentsService.getById(id as string),
		enabled: Boolean(id),
	});
}

export function useInitiatePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: InitiatePaymentInput) =>
			paymentsService.initiate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
		},
	});
}

export function useConfirmFreeOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: ConfirmFreeOrderInput) =>
			paymentsService.confirmFreeOrder(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
		},
	});
}

export function useVerifyPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: VerifyPaymentInput) => paymentsService.verify(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
		},
	});
}

export function useRefundPayment(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: RefundPaymentInput) =>
			paymentsService.refund(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
			queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(id) });
		},
	});
}

export function useUpdatePayment(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdatePaymentInput) =>
			paymentsService.update(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
			queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(id) });
		},
	});
}

export function useDeletePayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => paymentsService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
		},
	});
}

// Guest checkout hooks (no auth required)
export function useGuestCheckout() {
	return useMutation({
		mutationFn: (input: GuestCheckoutInput) =>
			paymentsService.guestCheckout(input),
	});
}

export function useGuestVerifyPayment() {
	return useMutation({
		mutationFn: (input: GuestVerifyPaymentInput) =>
			paymentsService.guestVerifyPayment(input),
	});
}

export function useGuestPayment(id?: string) {
	return useQuery({
		queryKey: [...paymentsKeys.detail(id ?? ""), "guest"],
		queryFn: () => paymentsService.guestGetPayment(id as string),
		enabled: Boolean(id),
	});
}
