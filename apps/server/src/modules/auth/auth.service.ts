import { prisma } from "@unievent/db";
import { env } from "@unievent/env/server";
import type {
	AuthSession,
	AuthTokens,
	ChangePasswordInput,
	ForgotPasswordInput,
	LoginInput,
	PublicUser,
	RefreshSessionInput,
	RegisterInput,
	ResetPasswordInput,
	VerifyEmailInput,
} from "@unievent/schema";
import { publicUserSchema } from "@unievent/schema";

import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "@/common/exceptions/app-error";
import { auth } from "@/common/utils/better-auth";

type BetterAuthUser = {
	id: string;
	name: string | null;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	role?: unknown;
	skills?: unknown;
	createdAt: Date;
	updatedAt: Date;
};

type BetterAuthSession = {
	id: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
	userId: string;
};

type BetterAuthSessionContext = {
	user: BetterAuthUser;
	session: BetterAuthSession;
};

type AuthApiResult<T> = {
	headers: Headers;
	response: T;
};

type AuthResponsePayload = {
	user: PublicUser;
	tokens: AuthTokens;
};

export type AuthServiceResult<T> = {
	data: T;
	headers?: Headers;
};

export class AuthService {
	private normalizeEmail(email: string) {
		return email.trim().toLowerCase();
	}

	private getWebUrl(pathname: string) {
		const baseUrl = env.WEB_APP_URL;
		if (!baseUrl) {
			return undefined;
		}

		return `${baseUrl.replace(/\/$/, "")}${pathname}`;
	}

	private toPublicUser(user: BetterAuthUser): PublicUser {
		return publicUserSchema.parse({
			id: user.id,
			name: user.name,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image ?? null,
			role: typeof user.role === "string" ? user.role : "USER",
			skills: Array.isArray(user.skills)
				? user.skills.filter(
						(skill): skill is string => typeof skill === "string",
					)
				: [],
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	}

	private toAuthTokens(
		session: Pick<BetterAuthSession, "token" | "expiresAt">,
	): AuthTokens {
		const expiresAt = session.expiresAt.toISOString();
		return {
			accessToken: session.token,
			refreshToken: session.token,
			accessTokenExpiresAt: expiresAt,
			refreshTokenExpiresAt: expiresAt,
		};
	}

	private mapAuthError(error: unknown): never {
		if (!error || typeof error !== "object") {
			throw error;
		}

		const typedError = error as {
			message?: unknown;
			status?: unknown;
			statusCode?: unknown;
			body?: { message?: unknown };
		};

		const message =
			typeof typedError.body?.message === "string"
				? typedError.body.message
				: typeof typedError.message === "string"
					? typedError.message
					: "Authentication request failed";

		const status =
			typeof typedError.statusCode === "number"
				? typedError.statusCode
				: typeof typedError.status === "number"
					? typedError.status
					: undefined;

		if (status === 401) {
			throw new UnauthorizedError(message);
		}

		if (status === 404) {
			throw new NotFoundError(message);
		}

		if (status === 409) {
			throw new ConflictError(message);
		}

		if (status === 400 || status === 422 || status === 403) {
			throw new BadRequestError(message);
		}

		throw error;
	}

	private async runAuthCall<T>(callback: () => Promise<T>) {
		try {
			return await callback();
		} catch (error) {
			this.mapAuthError(error);
		}
	}

	private async resolveSessionByToken(token: string) {
		const session = await prisma.session.findUnique({
			where: { token },
			include: { user: true },
		});

		if (!session) {
			throw new UnauthorizedError("Session not found");
		}

		if (session.expiresAt <= new Date()) {
			await prisma.session.delete({ where: { id: session.id } });
			throw new UnauthorizedError("Session expired");
		}

		return session;
	}

	private async buildAuthPayloadFromToken(
		token: string,
	): Promise<AuthResponsePayload> {
		const session = await this.resolveSessionByToken(token);

		return {
			user: this.toPublicUser(session.user as BetterAuthUser),
			tokens: this.toAuthTokens(session),
		};
	}

	private toAuthSession(
		session: {
			id: string;
			expiresAt: Date;
			createdAt: Date;
			updatedAt: Date;
			ipAddress: string | null;
			userAgent: string | null;
		},
		currentSessionId: string,
	): AuthSession {
		return {
			id: session.id,
			expiresAt: session.expiresAt,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			isCurrent: session.id === currentSessionId,
		};
	}

	async register(
		input: RegisterInput,
		headers: Headers,
	): Promise<AuthServiceResult<AuthResponsePayload>> {
		const email = this.normalizeEmail(input.email);
		const name = input.name?.trim() || email.split("@")[0] || email;

		const result = await this.runAuthCall(
			() =>
				auth.api.signUpEmail({
					body: {
						email,
						password: input.password,
						name,
					},
					headers,
					returnHeaders: true,
				}) as Promise<
					AuthApiResult<{
						token: string | null;
						user: BetterAuthUser;
					}>
				>,
		);

		if (!result.response.token) {
			throw new BadRequestError(
				"Account created, but no active session was issued. Please sign in.",
			);
		}

		// Link guest attendees to the new user
		// This allows guests who purchased tickets to see them after signing up
		try {
			await prisma.attendee.updateMany({
				where: {
					email: email,
					userId: null, // Only update guest attendees
				},
				data: {
					userId: result.response.user.id,
				},
			});
		} catch (error) {
			// Log but don't fail registration if linking fails
			console.error("Failed to link guest attendees:", error);
		}

		return {
			data: await this.buildAuthPayloadFromToken(result.response.token),
			headers: result.headers,
		};
	}

	async login(
		input: LoginInput,
		headers: Headers,
	): Promise<AuthServiceResult<AuthResponsePayload>> {
		const email = this.normalizeEmail(input.email);

		const result = await this.runAuthCall(
			() =>
				auth.api.signInEmail({
					body: {
						email,
						password: input.password,
					},
					headers,
					returnHeaders: true,
				}) as Promise<
					AuthApiResult<{
						token: string;
						user: BetterAuthUser;
					}>
				>,
		);

		// Link any guest attendees with matching email to this user
		// This handles cases where user bought tickets before creating account
		try {
			await prisma.attendee.updateMany({
				where: {
					email: email,
					userId: null,
				},
				data: {
					userId: result.response.user.id,
				},
			});
		} catch (error) {
			// Log but don't fail login if linking fails
			console.error("Failed to link guest attendees:", error);
		}

		return {
			data: await this.buildAuthPayloadFromToken(result.response.token),
			headers: result.headers,
		};
	}

	async refresh(
		input: RefreshSessionInput,
		headers: Headers,
	): Promise<AuthServiceResult<AuthResponsePayload>> {
		if (input.refreshToken) {
			return {
				data: await this.buildAuthPayloadFromToken(input.refreshToken),
			};
		}

		const sessionResult = await this.runAuthCall(
			() =>
				auth.api.getSession({
					headers,
					returnHeaders: true,
				}) as Promise<AuthApiResult<BetterAuthSessionContext | null>>,
		);

		if (!sessionResult.response) {
			throw new UnauthorizedError("No active session found");
		}

		return {
			data: {
				user: this.toPublicUser(sessionResult.response.user),
				tokens: this.toAuthTokens(sessionResult.response.session),
			},
			headers: sessionResult.headers,
		};
	}

	async logout(
		input: RefreshSessionInput,
		headers: Headers,
	): Promise<AuthServiceResult<void>> {
		if (input.refreshToken) {
			const result = await prisma.session.deleteMany({
				where: { token: input.refreshToken },
			});

			if (result.count === 0) {
				throw new UnauthorizedError("Invalid refresh token");
			}

			return { data: undefined };
		}

		const result = await this.runAuthCall(
			() =>
				auth.api.signOut({
					headers,
					returnHeaders: true,
				}) as Promise<AuthApiResult<{ success: boolean }>>,
		);

		return {
			data: undefined,
			headers: result.headers,
		};
	}

	async logoutAll(headers: Headers): Promise<AuthServiceResult<void>> {
		await this.runAuthCall(
			() =>
				auth.api.revokeSessions({ headers }) as Promise<{
					status: boolean;
				}>,
		);

		const result = await this.runAuthCall(
			() =>
				auth.api.signOut({
					headers,
					returnHeaders: true,
				}) as Promise<AuthApiResult<{ success: boolean }>>,
		);

		return {
			data: undefined,
			headers: result.headers,
		};
	}

	async listSessions(
		userId: string,
		currentSessionId: string,
	): Promise<AuthSession[]> {
		const sessions = await prisma.session.findMany({
			where: {
				userId,
				expiresAt: {
					gt: new Date(),
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
				ipAddress: true,
				userAgent: true,
			},
		});

		return sessions.map((session) =>
			this.toAuthSession(session, currentSessionId),
		);
	}

	async revokeSession(userId: string, sessionId: string, headers: Headers) {
		const session = await prisma.session.findFirst({
			where: {
				id: sessionId,
				userId,
			},
			select: {
				id: true,
				token: true,
			},
		});

		if (!session) {
			throw new NotFoundError("Session not found");
		}

		await this.runAuthCall(
			() =>
				auth.api.revokeSession({
					body: {
						token: session.token,
					},
					headers,
				}) as Promise<{ status: boolean }>,
		);
	}

	async getCurrentUser(userId: string): Promise<PublicUser> {
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new UnauthorizedError("Authenticated user no longer exists");
		}

		return this.toPublicUser(user as BetterAuthUser);
	}

	async forgotPassword(input: ForgotPasswordInput) {
		const redirectTo = this.getWebUrl("/reset-password");

		await this.runAuthCall(
			() =>
				auth.api.requestPasswordReset({
					body: {
						email: this.normalizeEmail(input.email),
						redirectTo,
					},
				}) as Promise<{
					status: boolean;
					message: string;
				}>,
		);

		return { message: "If the email exists, a reset link will be sent" };
	}

	async resetPassword(input: ResetPasswordInput) {
		await this.runAuthCall(
			() =>
				auth.api.resetPassword({
					body: {
						token: input.token,
						newPassword: input.password,
					},
				}) as Promise<{ status: boolean }>,
		);

		return { message: "Password reset successful. Please login again." };
	}

	async changePassword(
		input: ChangePasswordInput,
		headers: Headers,
	): Promise<AuthServiceResult<AuthResponsePayload>> {
		const result = await this.runAuthCall(
			() =>
				auth.api.changePassword({
					body: {
						currentPassword: input.currentPassword,
						newPassword: input.newPassword,
						revokeOtherSessions: true,
					},
					headers,
					returnHeaders: true,
				}) as Promise<
					AuthApiResult<{
						token: string | null;
						user: BetterAuthUser;
					}>
				>,
		);

		if (!result.response.token) {
			throw new UnauthorizedError(
				"Session token missing after password change",
			);
		}

		return {
			data: await this.buildAuthPayloadFromToken(result.response.token),
			headers: result.headers,
		};
	}

	async requestEmailVerification(
		userId: string,
		headers: Headers,
		email?: string,
	) {
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new UnauthorizedError("User not found");
		}

		if (user.emailVerified) {
			throw new BadRequestError("Email is already verified");
		}

		const targetEmail = this.normalizeEmail(email ?? user.email);

		if (targetEmail !== user.email) {
			const existingUser = await prisma.user.findUnique({
				where: { email: targetEmail },
			});
			if (existingUser) {
				throw new ConflictError("Email is already in use");
			}
		}

		await this.runAuthCall(
			() =>
				auth.api.sendVerificationEmail({
					body: {
						email: targetEmail,
						callbackURL: this.getWebUrl("/verify-email"),
					},
					headers,
				}) as Promise<{ status: boolean }>,
		);

		return { message: "Verification email sent" };
	}

	async verifyEmail(input: VerifyEmailInput, headers?: Headers) {
		await this.runAuthCall(
			() =>
				auth.api.verifyEmail({
					query: {
						token: input.token,
					},
					headers,
				}) as Promise<undefined | { status: boolean }>,
		);

		return { message: "Email verified successfully" };
	}
}

export const authService = new AuthService();
