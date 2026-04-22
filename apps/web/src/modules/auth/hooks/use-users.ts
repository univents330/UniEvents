"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileInput } from "@unievent/schema";
import { type UserListQuery, usersService } from "../services/users.service";

const usersKeys = {
	all: ["users"] as const,
	me: () => [...usersKeys.all, "me"] as const,
	lists: () => [...usersKeys.all, "list"] as const,
	list: (query?: UserListQuery) => [...usersKeys.lists(), query ?? {}] as const,
	details: () => [...usersKeys.all, "detail"] as const,
	detail: (userId: string) => [...usersKeys.details(), userId] as const,
	hostProfile: (userId: string) =>
		[...usersKeys.all, "host-profile", userId] as const,
};

export function useMe() {
	return useQuery({
		queryKey: usersKeys.me(),
		queryFn: () => usersService.getMe(),
	});
}

export function useUpdateMe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateProfileInput) => usersService.updateMe(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: usersKeys.me() });
		},
	});
}

export function useSetHostMode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (enabled: boolean) => usersService.setHostMode(enabled),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: usersKeys.me() });
		},
	});
}

export function useUsers(query?: UserListQuery) {
	return useQuery({
		queryKey: usersKeys.list(query),
		queryFn: () => usersService.list(query),
	});
}

export function useUser(userId?: string) {
	return useQuery({
		queryKey: usersKeys.detail(userId ?? ""),
		queryFn: () => usersService.getById(userId as string),
		enabled: Boolean(userId),
	});
}

export function useHostProfile(userId?: string) {
	return useQuery({
		queryKey: usersKeys.hostProfile(userId ?? ""),
		queryFn: () => usersService.getHostProfile(userId as string),
		enabled: Boolean(userId),
	});
}
