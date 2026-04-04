import type {
	AuthResponse,
	LoginInput,
	PublicUser,
	RegisterInput,
	ResetPasswordInput,
} from "@voltaze/schema";
import apiClient, { tokenManager } from "@/shared/lib/api-client";

export const authService = {
	/**
	 * Register a new user
	 */
	async register(data: RegisterInput) {
		const response = await apiClient.post<AuthResponse>("/auth/register", data);
		const { tokens } = response.data;
		tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
		return response.data;
	},

	/**
	 * Login with email and password
	 */
	async login(credentials: LoginInput) {
		const response = await apiClient.post<AuthResponse>(
			"/auth/login",
			credentials,
		);
		const { tokens } = response.data;
		tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
		return response.data;
	},

	/**
	 * Logout the current user
	 */
	async logout(): Promise<void> {
		const refreshToken = tokenManager.getRefreshToken();
		try {
			if (refreshToken) {
				await apiClient.post("/auth/logout", { refreshToken });
			}
		} finally {
			tokenManager.clearTokens();
		}
	},

	/**
	 * Get current user profile
	 */
	async getCurrentUser() {
		const response = await apiClient.get<PublicUser>("/auth/me");
		return response.data;
	},

	/**
	 * Refresh access token
	 */
	async refreshToken(refreshToken: string) {
		const response = await apiClient.post<AuthResponse>("/auth/refresh", {
			refreshToken,
		});
		const { tokens } = response.data;
		tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
		return response.data;
	},

	/**
	 * Request password reset email
	 */
	async forgotPassword(email: string): Promise<void> {
		await apiClient.post("/auth/forgot-password", { email });
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(data: ResetPasswordInput): Promise<void> {
		await apiClient.post("/auth/reset-password", data);
	},

	/**
	 * Change password
	 */
	async changePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<void> {
		await apiClient.post("/auth/change-password", {
			currentPassword,
			newPassword,
		});
	},
};
