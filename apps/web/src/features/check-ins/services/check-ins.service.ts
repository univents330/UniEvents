import type {
	CheckIn,
	CheckInFilterInput,
	CreateCheckInInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types";

export const checkInsService = {
	/**
	 * Get all check-ins with optional filters
	 */
	async getCheckIns(params?: CheckInFilterInput) {
		const response = await apiClient.get<PaginatedResponse<CheckIn>>(
			"/check-ins",
			{ params },
		);
		return response.data;
	},

	/**
	 * Get check-ins for a specific event
	 */
	async getEventCheckIns(eventId: string, params?: CheckInFilterInput) {
		const response = await apiClient.get<PaginatedResponse<CheckIn>>(
			"/check-ins",
			{
				params: { ...params, eventId },
			},
		);
		return response.data;
	},

	/**
	 * Get check-ins for a specific attendee
	 */
	async getAttendeeCheckIns(attendeeId: string, params?: CheckInFilterInput) {
		const response = await apiClient.get<PaginatedResponse<CheckIn>>(
			"/check-ins",
			{
				params: { ...params, attendeeId },
			},
		);
		return response.data;
	},

	/**
	 * Get a single check-in by ID
	 */
	async getCheckIn(id: string) {
		const response = await apiClient.get<CheckIn>(`/check-ins/${id}`);
		return response.data;
	},

	/**
	 * Create a new check-in
	 */
	async createCheckIn(data: CreateCheckInInput) {
		const response = await apiClient.post<CheckIn>("/check-ins", data);
		return response.data;
	},
};
