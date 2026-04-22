import type { UpdateProfileInput, UserFilterInput } from "@unievent/schema";
import {
	apiClient,
	type QueryValue,
	toQueryParams,
} from "@/core/lib/api-client";

export type UserListQuery = Partial<UserFilterInput>;

function serializeQuery(
	query?: Record<string, QueryValue>,
): Record<string, string | number | boolean> | undefined {
	if (!query) {
		return undefined;
	}

	return toQueryParams(query);
}

type PublicUserRecord = {
	id: string;
	name: string | null;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string;
	skills: string[];
	createdAt: string;
	updatedAt: string;
};

type PaginatedUsersResponse = {
	data: PublicUserRecord[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
};

type HostProfile = PublicUserRecord & {
	events: Array<{
		id: string;
		name: string;
		slug: string;
		startDate: string;
		status: string;
	}>;
};

export const usersService = {
	async getMe() {
		const response = await apiClient.get<PublicUserRecord>("/users/me");
		return response.data;
	},

	async updateMe(input: UpdateProfileInput) {
		const response = await apiClient.patch<PublicUserRecord>(
			"/users/me",
			input,
		);
		return response.data;
	},

	async setHostMode(enabled: boolean) {
		const response = await apiClient.patch<PublicUserRecord>(
			"/users/me/host-mode",
			{ enabled },
		);
		return response.data;
	},

	async list(query?: UserListQuery) {
		const response = await apiClient.get<PaginatedUsersResponse>("/users", {
			params: serializeQuery(query as Record<string, QueryValue> | undefined),
		});
		return response.data;
	},

	async getById(userId: string) {
		const response = await apiClient.get<PublicUserRecord>(`/users/${userId}`);
		return response.data;
	},

	async getHostProfile(userId: string) {
		const response = await apiClient.get<HostProfile>(
			`/users/${userId}/host-profile`,
		);
		return response.data;
	},
};
