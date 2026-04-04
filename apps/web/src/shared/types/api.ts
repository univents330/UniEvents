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
}

export interface ValidatePassResponse {
	valid: boolean;
	pass?: import("@voltaze/schema").Pass;
	message?: string;
}

export interface CheckInStats {
	totalCheckIns: number;
	qrScans: number;
	manualCheckIns: number;
}
