"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PublicUser } from "@voltaze/schema";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { showNotification } from "@/shared/lib/notifications";
import { startTopLoader } from "@/shared/lib/top-loader-events";
import { authService } from "../services";

const AUTH_KEYS = {
	currentUser: ["auth", "currentUser"] as const,
};

type AuthRedirectOptions = {
	redirectTo?: string;
};

function readUserFromAuthPayload(payload: unknown): PublicUser | null {
	if (!payload || typeof payload !== "object") {
		return null;
	}

	const record = payload as Record<string, unknown>;
	const candidate =
		(record.user as PublicUser | undefined) ??
		((record.data as Record<string, unknown> | undefined)?.user as
			| PublicUser
			| undefined) ??
		null;

	if (!candidate || typeof candidate !== "object") {
		return null;
	}

	if (typeof candidate.email !== "string") {
		return null;
	}

	return candidate;
}

async function syncCurrentUserCache(
	queryClient: ReturnType<typeof useQueryClient>,
	payload: unknown,
) {
	const payloadUser = readUserFromAuthPayload(payload);
	if (payloadUser) {
		queryClient.setQueryData(AUTH_KEYS.currentUser, payloadUser);
	}

	const currentUser = await authService.getCurrentUser();
	queryClient.setQueryData(
		AUTH_KEYS.currentUser,
		currentUser ?? payloadUser ?? null,
	);

	await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });
}

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
export function useRegister(options?: AuthRedirectOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.register,
		onSuccess: async (data) => {
			await syncCurrentUserCache(queryClient, data);
			showNotification({
				title: "Welcome!",
				message: "Your account has been created successfully.",
				color: "green",
			});
			window.location.assign(options?.redirectTo || "/");
		},
		onError: (error: unknown) => {
			showNotification({
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
export function useLogin(options?: AuthRedirectOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.login,
		onSuccess: async (data) => {
			await syncCurrentUserCache(queryClient, data);
			const payloadUser = readUserFromAuthPayload(data);
			showNotification({
				title: "Welcome back!",
				message: `Logged in as ${payloadUser?.email ?? "your account"}`,
				color: "green",
			});
			window.location.assign(options?.redirectTo || "/");
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Login failed",
				message: getApiErrorMessage(error, "Invalid credentials"),
				color: "red",
			});
		},
	});
}

/**
 * Hook for Google login
 */
export function useGoogleSignIn() {
	return useMutation({
		mutationFn: (redirectTo?: string) =>
			authService.signInWithGoogle(redirectTo),
		onSuccess: () => {
			// Google sign-in now redirects to the backend OAuth endpoint.
			// No session payload is returned to this callback in the current page context.
		},
		onError: (error: unknown) => {
			showNotification({
				title: "Google sign-in failed",
				message: getApiErrorMessage(
					error,
					"Google sign-in is not configured correctly",
				),
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
			showNotification({
				title: "Logged out",
				message: "You have been logged out successfully.",
				color: "blue",
			});
			startTopLoader();
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
			showNotification({
				title: "Email sent",
				message: "Check your email for password reset instructions.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
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
			showNotification({
				title: "Password reset",
				message: "Your password has been reset successfully.",
				color: "green",
			});
			startTopLoader();
			router.push("/login");
		},
		onError: (error: unknown) => {
			showNotification({
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
			showNotification({
				title: "Password changed",
				message: "Your password has been changed successfully.",
				color: "green",
			});
		},
		onError: (error: unknown) => {
			showNotification({
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
