import { isAxiosError } from "axios";
import type { ApiError } from "@/shared/types";

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (isAxiosError<ApiError>(error)) {
		return error.response?.data?.message ?? fallback;
	}

	return fallback;
}
