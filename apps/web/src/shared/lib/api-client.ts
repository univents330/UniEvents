import { env } from "@voltaze/env/web";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getActiveBackendUrl } from "./backend-url";

export const apiClient = axios.create({
	baseURL: getActiveBackendUrl(),
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// Token management
const TOKEN_KEYS = {
	ACCESS: "voltaze_access_token",
	REFRESH: "voltaze_refresh_token",
} as const;

export const tokenManager = {
	getAccessToken: () => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(TOKEN_KEYS.ACCESS);
	},

	getRefreshToken: () => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(TOKEN_KEYS.REFRESH);
	},

	setTokens: (accessToken: string, refreshToken: string) => {
		if (typeof window === "undefined") return;
		localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
		localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
	},

	clearTokens: () => {
		if (typeof window === "undefined") return;
		localStorage.removeItem(TOKEN_KEYS.ACCESS);
		localStorage.removeItem(TOKEN_KEYS.REFRESH);
	},
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		config.baseURL = getActiveBackendUrl();
		const token = tokenManager.getAccessToken();
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
	error: AxiosError | null,
	token: string | null = null,
) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// If error is 401 and we haven't retried yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// Wait for the refresh to complete
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return apiClient(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = tokenManager.getRefreshToken();
			if (!refreshToken) {
				// No refresh token, clear everything and redirect to login
				tokenManager.clearTokens();
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
				return Promise.reject(error);
			}

			try {
				// Call refresh endpoint
				const response = await axios.post(
					`${getActiveBackendUrl()}/auth/refresh`,
					{
						refreshToken,
					},
				);

				const { tokens } = response.data;
				tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

				// Update the original request with new token
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
				}

				processQueue(null, tokens.accessToken);
				return apiClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as AxiosError, null);
				tokenManager.clearTokens();
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

export default apiClient;
