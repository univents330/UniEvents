import { prisma, type User } from "@voltaze/db";
import type {
	LoginInput,
	RefreshSessionInput,
	RegisterInput,
} from "@voltaze/schema";

import {
	ConflictError,
	UnauthorizedError,
} from "@/common/exceptions/app-error";

import {
	createAccessToken,
	createRefreshExpiryDate,
	createRefreshToken,
	hashPassword,
	hashRefreshToken,
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
		const user = await prisma.$transaction(async (tx) => {
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
		await prisma.session.deleteMany({
			where: { token: hashedRefreshToken },
		});
	}

	async getCurrentUser(userId: string): Promise<PublicUser> {
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new UnauthorizedError("Authenticated user no longer exists");
		}

		return toPublicUser(user);
	}
}

export const authService = new AuthService();
