import type {
	LoginInput,
	PublicUser,
	RegisterInput,
	ResetPasswordInput,
} from "@voltaze/schema";
import { createAuthClient } from "better-auth/react";
import { getActiveBackendUrl } from "@/shared/lib/backend-url";

function getAuthClient() {
	return createAuthClient({
		baseURL: getActiveBackendUrl(),
		fetchOptions: {
			credentials: "include",
		},
	});
}

export const authService = {
	/**
	 * Register a new user
	 */
	async register(data: RegisterInput) {
		const authClient = getAuthClient();
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
		const authClient = getAuthClient();
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
	 * Start a Google sign-in flow
	 */
	async signInWithGoogle(redirectTo?: string) {
		const normalizedRedirect = redirectTo?.startsWith("/") ? redirectTo : "/";
		const callbackURL = `${window.location.origin}${normalizedRedirect}`;
		const errorCallbackURL = `${window.location.origin}/login${
			normalizedRedirect !== "/"
				? `?redirect=${encodeURIComponent(normalizedRedirect)}`
				: ""
		}`;
		const authClient = getAuthClient();
		const { data, error } = await authClient.signIn.social({
			provider: "google",
			callbackURL,
			errorCallbackURL,
		});

		if (error) {
			throw error;
		}

		if (data && typeof data === "object") {
			const redirectUrl = (data as { url?: string }).url;
			if (redirectUrl) {
				window.location.assign(redirectUrl);
			}
		}

		return data;
	},

	/**
	 * Logout the current user
	 */
	async logout(): Promise<void> {
		const authClient = getAuthClient();
		await authClient.signOut();
	},

	/**
	 * Get current user profile
	 */
	async getCurrentUser(): Promise<PublicUser | null> {
		const authClient = getAuthClient();
		const { data: session } = await authClient.getSession();
		const user = session?.user as PublicUser | undefined;
		return user ?? null;
	},

	/**
	 * Get active sessions for the current user
	 */
	async getSessions() {
		const authClient = getAuthClient();
		const { data } = await authClient.listSessions();
		return data ?? [];
	},

	/**
	 * Revoke a specific session
	 */
	async revokeSession(sessionToken: string): Promise<void> {
		const authClient = getAuthClient();
		await authClient.revokeSession({ token: sessionToken });
	},

	/**
	 * Refresh access token
	 */
	async refreshToken(_refreshToken: string) {
		const authClient = getAuthClient();
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
		const authClient = getAuthClient();
		await authClient.requestPasswordReset({
			email,
			redirectTo: `${window.location.origin}/reset-password`,
		});
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(data: ResetPasswordInput): Promise<void> {
		const authClient = getAuthClient();
		await authClient.resetPassword({
			token: data.token,
			newPassword: data.password,
		});
	},

	/**
	 * Update current user's profile (name, image)
	 */
	async updateProfile(data: {
		name?: string;
		image?: string | null;
	}): Promise<void> {
		const authClient = getAuthClient();
		const { error } = await authClient.updateUser(data);
		if (error) {
			throw error;
		}
	},

	/**
	 * Change password
	 */
	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<void> {
		const authClient = getAuthClient();
		await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		});
	},
};
