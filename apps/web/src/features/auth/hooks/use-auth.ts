"use client";

import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { authService } from "../services";

const AUTH_KEYS = {
	currentUser: ["auth", "currentUser"] as const,
};

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser() {
	return useQuery({
		queryKey: AUTH_KEYS.currentUser,
		queryFn: authService.getCurrentUser,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY, // User data doesn't change often
	});
}

/**
 * Hook for user registration
 */
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.register,
		onSuccess: (data) => {
			queryClient.setQueryData(AUTH_KEYS.currentUser, data?.user ?? null);
			notifications.show({
				title: "Welcome!",
				message: "Your account has been created successfully.",
				color: "green",
			});
			window.location.assign("/");
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Registration failed",
				message: getApiErrorMessage(error, "An error occurred"),
				color: "red",
			});
		},
	});
}

/**
 * Hook for user login
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			queryClient.setQueryData(AUTH_KEYS.currentUser, data?.user ?? null);
			notifications.show({
				title: "Welcome back!",
				message: `Logged in as ${data?.user?.email ?? "your account"}`,
				color: "green",
			});
			window.location.assign("/");
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Login failed",
				message: getApiErrorMessage(error, "Invalid credentials"),
				color: "red",
			});
		},
	});
}

/**
 * Hook for user logout
 */
export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.logout,
		onSuccess: () => {
			queryClient.clear();
			notifications.show({
				title: "Logged out",
				message: "You have been logged out successfully.",
				color: "blue",
			});
			router.push("/login");
		},
	});
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
	return useMutation({
		mutationFn: authService.forgotPassword,
		onSuccess: () => {
			notifications.show({
				title: "Email sent",
				message: "Check your email for password reset instructions.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "An error occurred"),
				color: "red",
			});
		},
	});
}

/**
 * Hook for reset password
 */
export function useResetPassword() {
	const router = useRouter();

	return useMutation({
		mutationFn: authService.resetPassword,
		onSuccess: () => {
			notifications.show({
				title: "Password reset",
				message: "Your password has been reset successfully.",
				color: "green",
			});
			router.push("/login");
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Invalid or expired token"),
				color: "red",
			});
		},
	});
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
	return useMutation({
		mutationFn: ({
			oldPassword,
			newPassword,
		}: {
			oldPassword: string;
			newPassword: string;
		}) => authService.changePassword(oldPassword, newPassword),
		onSuccess: () => {
			notifications.show({
				title: "Password changed",
				message: "Your password has been changed successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			notifications.show({
				title: "Error",
				message: getApiErrorMessage(error, "Failed to change password"),
				color: "red",
			});
		},
	});
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
	const { data: user, isLoading, error } = useCurrentUser();

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		error,
	};
}
