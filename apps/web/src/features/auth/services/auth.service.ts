import { env } from "@voltaze/env/web";
import type {
	AuthSession,
	LoginInput,
	PublicUser,
	RegisterInput,
	ResetPasswordInput,
} from "@voltaze/schema";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_SERVER_URL,
	fetchOptions: {
		credentials: "include",
	},
});

export const authService = {
	/**
	 * Register a new user
	 */
	async register(data: RegisterInput) {
		const name = data.name?.trim() || data.email.split("@")[0] || data.email;
		const { data: session, error } = await authClient.signUp.email({
			email: data.email,
			password: data.password,
			name,
		});

		if (error) {
			throw error;
		}

		return session;
	},

	/**
	 * Login with email and password
	 */
	async login(credentials: LoginInput) {
		const { data: session, error } = await authClient.signIn.email({
			email: credentials.email,
			password: credentials.password,
		});

		if (error) {
			throw error;
		}

		return session;
	},

	/**
	 * Logout the current user
	 */
	async logout(): Promise<void> {
		await authClient.signOut();
	},

	/**
	 * Get current user profile
	 */
	async getCurrentUser() {
		const { data: session } = await authClient.getSession();
		return session?.user ?? null;
	},

	/**
	 * Get active sessions for the current user
	 */
	async getSessions() {
		const { data } = await authClient.listSessions();
		return data ?? [];
	},

	/**
	 * Revoke a specific session
	 */
	async revokeSession(sessionToken: string): Promise<void> {
		await authClient.revokeSession({ token: sessionToken });
	},

	/**
	 * Refresh access token
	 */
	async refreshToken(_refreshToken: string) {
		const response = await authClient.getSession({
			fetchOptions: {
				credentials: "include",
			},
		});
		return response.data;
	},

	/**
	 * Request password reset email
	 */
	async forgotPassword(email: string): Promise<void> {
		await authClient.requestPasswordReset({
			email,
			redirectTo: `${window.location.origin}/reset-password`,
		});
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(data: ResetPasswordInput): Promise<void> {
		await authClient.resetPassword({
			token: data.token,
			newPassword: data.password,
		});
	},

	/**
	 * Change password
	 */
	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<void> {
		await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		});
	},
};
