import type {
	CreatePassInput,
	Pass,
	PassFilterInput,
	UpdatePassInput,
	ValidatePassInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type { PaginatedResponse, ValidatePassResponse } from "@/shared/types";

export const passesService = {
	/**
	 * Get all passes with optional filters
	 */
	async getPasses(params?: PassFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Pass>>("/passes", {
			params,
		});
		return response.data;
	},

	/**
	 * Get passes for a specific event
	 */
	async getEventPasses(eventId: string, params?: PassFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Pass>>("/passes", {
			params: { ...params, eventId },
		});
		return response.data;
	},

	/**
	 * Get passes for a specific attendee
	 */
	async getAttendeePasses(attendeeId: string, params?: PassFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Pass>>("/passes", {
			params: { ...params, attendeeId },
		});
		return response.data;
	},

	/**
	 * Get a single pass by ID
	 */
	async getPass(id: string) {
		const response = await apiClient.get<Pass>(`/passes/${id}`);
		return response.data;
	},

	/**
	 * Create a new pass
	 */
	async createPass(data: CreatePassInput) {
		const response = await apiClient.post<Pass>("/passes", data);
		return response.data;
	},

	/**
	 * Validate a pass
	 */
	async validatePass(data: ValidatePassInput) {
		const response = await apiClient.post<ValidatePassResponse>(
			"/passes/validate",
			data,
		);
		return response.data;
	},

	/**
	 * Update an existing pass
	 */
	async updatePass(id: string, data: UpdatePassInput) {
		const response = await apiClient.patch<Pass>(`/passes/${id}`, data);
		return response.data;
	},

	/**
	 * Delete a pass
	 */
	async deletePass(id: string): Promise<void> {
		await apiClient.delete(`/passes/${id}`);
	},
};
