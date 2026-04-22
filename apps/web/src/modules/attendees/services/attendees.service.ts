import type {
	Attendee,
	AttendeeFilterInput,
	CreateAttendeeInput,
	PaginatedResponse,
	UpdateAttendeeInput,
} from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type AttendeeListQuery = Partial<AttendeeFilterInput>;

type AttendeeRecord = Omit<Attendee, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
};

type AttendeeListResponse = PaginatedResponse<AttendeeRecord>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

export type { AttendeeRecord };

export const attendeesService = {
	async list(query?: AttendeeListQuery) {
		const response = await apiClient.get<AttendeeListResponse>("/attendees", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(id: string) {
		const response = await apiClient.get<AttendeeRecord>(`/attendees/${id}`);
		return response.data;
	},

	async create(input: CreateAttendeeInput) {
		const response = await apiClient.post<AttendeeRecord>("/attendees", input);
		return response.data;
	},

	async update(id: string, input: UpdateAttendeeInput) {
		const response = await apiClient.patch<AttendeeRecord>(
			`/attendees/${id}`,
			input,
		);
		return response.data;
	},

	async remove(id: string) {
		await apiClient.delete(`/attendees/${id}`);
	},
};
