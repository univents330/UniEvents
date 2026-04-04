import type {
	Attendee,
	AttendeeFilterInput,
	CreateAttendeeInput,
	UpdateAttendeeInput,
} from "@voltaze/schema";
import apiClient from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types";

export const attendeesService = {
	/**
	 * Get all attendees with optional filters
	 */
	async getAttendees(params?: AttendeeFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Attendee>>(
			"/attendees",
			{ params },
		);
		return response.data;
	},

	/**
	 * Get attendees for a specific event
	 */
	async getEventAttendees(eventId: string, params?: AttendeeFilterInput) {
		const response = await apiClient.get<PaginatedResponse<Attendee>>(
			`/events/${eventId}/attendees`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Get a single attendee by ID
	 */
	async getAttendee(id: string) {
		const response = await apiClient.get<Attendee>(`/attendees/${id}`);
		return response.data;
	},

	/**
	 * Create a new attendee
	 */
	async createAttendee(data: CreateAttendeeInput) {
		const response = await apiClient.post<Attendee>("/attendees", data);
		return response.data;
	},

	/**
	 * Update an existing attendee
	 */
	async updateAttendee(id: string, data: UpdateAttendeeInput) {
		const response = await apiClient.patch<Attendee>(`/attendees/${id}`, data);
		return response.data;
	},

	/**
	 * Delete an attendee
	 */
	async deleteAttendee(id: string): Promise<void> {
		await apiClient.delete(`/attendees/${id}`);
	},
};
