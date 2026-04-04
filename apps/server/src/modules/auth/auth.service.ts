import { Prisma, prisma, type User } from "@voltaze/db";
import type {
	AuthSession,
	ChangePasswordInput,
	ForgotPasswordInput,
	LoginInput,
	RefreshSessionInput,
	RegisterInput,
	ResetPasswordInput,
	VerifyEmailInput,
} from "@voltaze/schema";

import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	UnauthorizedError,
} from "@/common/exceptions/app-error";

import {
	createAccessToken,
	createPasswordResetExpiryDate,
	createRefreshExpiryDate,
	createRefreshToken,
	createVerificationExpiryDate,
	createVerificationToken,
	hashPassword,
	hashRefreshToken,
	hashVerificationToken,
	verifyPassword,
} from "./auth.utils";

const CREDENTIALS_PROVIDER_ID = "credentials";

type AuthContext = {
	ipAddress?: string | null;
	userAgent?: string | null;
};

export type PublicUser = Pick<
	User,
	| "id"
	| "name"
	| "email"
	| "emailVerified"
	| "image"
	| "role"
	| "createdAt"
	| "updatedAt"
>;

function toPublicUser(user: User): PublicUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		emailVerified: user.emailVerified,
		image: user.image,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

export class AuthService {
	private normalizeEmail(email: string) {
		return email.trim().toLowerCase();
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

	private async createSession(user: User, context: AuthContext) {
		const refreshToken = createRefreshToken();
		const hashedRefreshToken = await hashRefreshToken(refreshToken);
		const expiresAt = createRefreshExpiryDate();

		const session = await prisma.session.create({
			data: {
				userId: user.id,
				token: hashedRefreshToken,
				expiresAt,
				ipAddress: context.ipAddress ?? null,
				userAgent: context.userAgent ?? null,
			},
		});

		const accessToken = await createAccessToken({
			userId: user.id,
			sessionId: session.id,
			email: user.email,
			role: user.role,
		});

		return {
			user: toPublicUser(user),
			tokens: {
				accessToken: accessToken.token,
				refreshToken,
				accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
				refreshTokenExpiresAt: expiresAt.toISOString(),
			},
		};
	}

	async register(input: RegisterInput, context: AuthContext) {
		const email = this.normalizeEmail(input.email);
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (existingUser) {
			throw new ConflictError("An account with this email already exists");
		}

		const passwordHash = await hashPassword(input.password);
		let user: User;
		try {
			user = await prisma.$transaction(async (tx) => {
				const createdUser = await tx.user.create({
					data: {
						email,
						name: input.name?.trim() || null,
					},
				});

				await tx.account.create({
					data: {
						userId: createdUser.id,
						accountId: email,
						providerId: CREDENTIALS_PROVIDER_ID,
						password: passwordHash,
					},
				});

				return createdUser;
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ConflictError("An account with this email already exists");
				}
			}

			throw error;
		}

		return this.createSession(user, context);
	}

	async login(input: LoginInput, context: AuthContext) {
		const email = this.normalizeEmail(input.email);
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				accounts: {
					where: {
						providerId: CREDENTIALS_PROVIDER_ID,
						accountId: email,
					},
					take: 1,
				},
			},
		});

		const account = user?.accounts[0];
		if (!user || !account?.password) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const isPasswordValid = await verifyPassword(
			input.password,
			account.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const { accounts: _accounts, ...userRow } = user;
		return this.createSession(userRow, context);
	}

	async refresh(input: RefreshSessionInput) {
		const hashedRefreshToken = await hashRefreshToken(input.refreshToken);
		const existingSession = await prisma.session.findUnique({
			where: { token: hashedRefreshToken },
			include: { user: true },
		});

		if (!existingSession) {
			throw new UnauthorizedError("Invalid refresh token");
		}

		if (existingSession.expiresAt <= new Date()) {
			await prisma.session.delete({ where: { id: existingSession.id } });
			throw new UnauthorizedError("Refresh token expired");
		}

		const refreshToken = createRefreshToken();
		const nextExpiresAt = createRefreshExpiryDate();
		const nextHashedRefreshToken = await hashRefreshToken(refreshToken);

		const rotatedSession = await prisma.session.update({
			where: { id: existingSession.id },
			data: {
				token: nextHashedRefreshToken,
				expiresAt: nextExpiresAt,
			},
			include: { user: true },
		});

		const accessToken = await createAccessToken({
			userId: rotatedSession.user.id,
			sessionId: rotatedSession.id,
			email: rotatedSession.user.email,
			role: rotatedSession.user.role,
		});

		return {
			user: toPublicUser(rotatedSession.user),
			tokens: {
				accessToken: accessToken.token,
				refreshToken,
				accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
				refreshTokenExpiresAt: nextExpiresAt.toISOString(),
			},
		};
	}

	async logout(input: RefreshSessionInput) {
		const hashedRefreshToken = await hashRefreshToken(input.refreshToken);
		const result = await prisma.session.deleteMany({
			where: { token: hashedRefreshToken },
		});

		if (result.count === 0) {
			throw new UnauthorizedError("Invalid refresh token");
		}
	}

	async logoutAll(userId: string) {
		await prisma.session.deleteMany({ where: { userId } });
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

	async revokeSession(userId: string, sessionId: string) {
		const session = await prisma.session.findFirst({
			where: {
				id: sessionId,
				userId,
			},
			select: {
				id: true,
			},
		});

		if (!session) {
			throw new NotFoundError("Session not found");
		}

		await prisma.session.delete({ where: { id: session.id } });
	}

	async getCurrentUser(userId: string): Promise<PublicUser> {
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new UnauthorizedError("Authenticated user no longer exists");
		}

		return toPublicUser(user);
	}

	async forgotPassword(input: ForgotPasswordInput) {
		const email = this.normalizeEmail(input.email);
		const user = await prisma.user.findUnique({ where: { email } });

		// Always return success to prevent email enumeration
		if (!user) {
			return { message: "If the email exists, a reset link will be sent" };
		}

		const token = createVerificationToken();
		const hashedToken = await hashVerificationToken(token);
		const expiresAt = createPasswordResetExpiryDate();

		await prisma.verification.upsert({
			where: { id: `password-reset:${user.id}` },
			update: {
				value: hashedToken,
				expiresAt,
			},
			create: {
				id: `password-reset:${user.id}`,
				identifier: email,
				value: hashedToken,
				expiresAt,
			},
		});

		// In production, send email with reset link containing the token
		// For now, return the token for testing purposes in development
		return {
			message: "If the email exists, a reset link will be sent",
			// Only include token in development for testing
			...(process.env.NODE_ENV !== "production" && { token }),
		};
	}

	async resetPassword(input: ResetPasswordInput) {
		const hashedToken = await hashVerificationToken(input.token);

		const verification = await prisma.verification.findFirst({
			where: {
				id: { startsWith: "password-reset:" },
				value: hashedToken,
				expiresAt: { gt: new Date() },
			},
		});

		if (!verification) {
			throw new BadRequestError("Invalid or expired reset token");
		}

		const userId = verification.id.replace("password-reset:", "");
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				accounts: {
					where: { providerId: CREDENTIALS_PROVIDER_ID },
					take: 1,
				},
			},
		});

		if (!user || !user.accounts[0]) {
			throw new BadRequestError("Invalid or expired reset token");
		}

		const passwordHash = await hashPassword(input.password);

		await prisma.$transaction([
			prisma.account.update({
				where: { id: user.accounts[0].id },
				data: { password: passwordHash },
			}),
			prisma.verification.delete({ where: { id: verification.id } }),
			// Invalidate all sessions for security
			prisma.session.deleteMany({ where: { userId: user.id } }),
		]);

		return { message: "Password reset successful. Please login again." };
	}

	async changePassword(
		userId: string,
		input: ChangePasswordInput,
		context: AuthContext,
	) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				accounts: {
					where: { providerId: CREDENTIALS_PROVIDER_ID },
					take: 1,
				},
			},
		});

		if (!user || !user.accounts[0]?.password) {
			throw new BadRequestError(
				"Password change not supported for this account",
			);
		}

		const isCurrentPasswordValid = await verifyPassword(
			input.currentPassword,
			user.accounts[0].password,
		);

		if (!isCurrentPasswordValid) {
			throw new UnauthorizedError("Current password is incorrect");
		}

		const passwordHash = await hashPassword(input.newPassword);

		await prisma.$transaction([
			prisma.account.update({
				where: { id: user.accounts[0].id },
				data: { password: passwordHash },
			}),
			// Invalidate all other sessions for security
			prisma.session.deleteMany({ where: { userId: user.id } }),
		]);

		// Create a new session for the current user
		const { accounts: _accounts, ...userRow } = user;
		return this.createSession(userRow, context);
	}

	async requestEmailVerification(userId: string, email?: string) {
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new UnauthorizedError("User not found");
		}

		if (user.emailVerified) {
			throw new BadRequestError("Email is already verified");
		}

		const targetEmail = email ?? user.email;
		if (targetEmail !== user.email) {
			// If changing email, check it's not already in use
			const existingUser = await prisma.user.findUnique({
				where: { email: targetEmail },
			});
			if (existingUser) {
				throw new ConflictError("Email is already in use");
			}
		}

		const token = createVerificationToken();
		const hashedToken = await hashVerificationToken(token);
		const expiresAt = createVerificationExpiryDate();

		await prisma.verification.upsert({
			where: { id: `email-verify:${user.id}` },
			update: {
				identifier: targetEmail,
				value: hashedToken,
				expiresAt,
			},
			create: {
				id: `email-verify:${user.id}`,
				identifier: targetEmail,
				value: hashedToken,
				expiresAt,
			},
		});

		// In production, send email with verification link
		return {
			message: "Verification email sent",
			...(process.env.NODE_ENV !== "production" && { token }),
		};
	}

	async verifyEmail(input: VerifyEmailInput) {
		const hashedToken = await hashVerificationToken(input.token);

		const verification = await prisma.verification.findFirst({
			where: {
				id: { startsWith: "email-verify:" },
				value: hashedToken,
				expiresAt: { gt: new Date() },
			},
		});

		if (!verification) {
			throw new BadRequestError("Invalid or expired verification token");
		}

		const userId = verification.id.replace("email-verify:", "");

		await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: {
					email: verification.identifier,
					emailVerified: true,
				},
			}),
			prisma.verification.delete({ where: { id: verification.id } }),
		]);

		return { message: "Email verified successfully" };
	}
}

export const authService = new AuthService();
