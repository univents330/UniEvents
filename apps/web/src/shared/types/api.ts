import type { AuthSession, InitiatePaymentItemInput } from "@voltaze/schema";

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface ApiError {
	message: string;
	errors?: Record<string, string[]>;
}

export interface InitiatePaymentResponse {
	payment: import("@voltaze/schema").Payment;
	razorpayOrderId: string;
	amount: number;
	currency: string;
	razorpayKeyId: string;
	checkoutItems?: InitiatePaymentItemInput[];
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	notes?: Record<string, string>;
}

export type VerifyPaymentResponse = {
	payment: import("@voltaze/schema").Payment;
	alreadyVerified: boolean;
};

export type ValidatePassResponse = import("@voltaze/schema").Pass;

export type AuthSessionResponse = AuthSession;

export interface CheckInStats {
	totalCheckIns: number;
	qrScans: number;
	manualCheckIns: number;
}
