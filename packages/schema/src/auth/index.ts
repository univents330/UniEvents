import type { Account, Session, User, Verification } from "@voltaze/db";
import { z } from "zod";

export type { Account, Session, User, Verification };

const ulidSchema = z
	.string()
	.regex(/^[0-9A-HJKMNP-TV-Z]{26}$/i, "Invalid ULID");

export const userRoleSchema = z.enum(["ADMIN", "HOST", "USER"]);

export const userSchema = z.object({
	id: ulidSchema,
	name: z.string().nullable(),
	email: z.string().email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	role: userRoleSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<User>;

export const publicUserSchema = userSchema.pick({
	id: true,
	name: true,
	email: true,
	emailVerified: true,
	image: true,
	role: true,
	createdAt: true,
	updatedAt: true,
});

export const authRequestContextSchema = z.object({
	userId: ulidSchema,
	sessionId: ulidSchema,
	email: z.string().email(),
	role: userRoleSchema,
});

export const authenticatedActorSchema = authRequestContextSchema.pick({
	userId: true,
	role: true,
});

export const authRequestMetaSchema = z.object({
	ipAddress: z.string().optional().nullable(),
	userAgent: z.string().optional().nullable(),
});

export const authSessionIdParamSchema = z.object({
	sessionId: ulidSchema,
});

export const accessTokenPayloadSchema = z.object({
	sub: ulidSchema,
	sessionId: ulidSchema,
	email: z.string().email(),
	role: userRoleSchema,
	type: z.literal("access"),
	iat: z.number().int().nonnegative(),
	exp: z.number().int().positive(),
	iss: z.string().min(1),
});

export const createAccessTokenInputSchema = z.object({
	userId: ulidSchema,
	sessionId: ulidSchema,
	email: z.string().email(),
	role: userRoleSchema,
});

export const createUserSchema = userSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		emailVerified: true,
	})
	.extend({
		email: z.string().trim().email(),
		name: z.string().trim().min(1).max(100).optional(),
		role: userRoleSchema.default("USER"),
	});

export const updateUserSchema = userSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial()
	.extend({
		email: z.string().trim().email().optional(),
		name: z.string().trim().min(1).max(100).nullable().optional(),
		role: userRoleSchema.optional(),
	});

export const sessionSchema = z.object({
	id: ulidSchema,
	userId: ulidSchema,
	token: z.string(),
	expiresAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
	ipAddress: z.string().nullable(),
	userAgent: z.string().nullable(),
}) satisfies z.ZodType<Session>;

export const createSessionSchema = sessionSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const authSessionSchema = sessionSchema
	.pick({
		id: true,
		expiresAt: true,
		createdAt: true,
		updatedAt: true,
		ipAddress: true,
		userAgent: true,
	})
	.extend({
		isCurrent: z.boolean(),
	});

export const accountSchema = z.object({
	id: ulidSchema,
	userId: ulidSchema,
	accountId: z.string(),
	providerId: z.string(),
	refreshToken: z.string().nullable(),
	accessToken: z.string().nullable(),
	accessTokenExpiresAt: z.date().nullable(),
	refreshTokenExpiresAt: z.date().nullable(),
	scope: z.string().nullable(),
	idToken: z.string().nullable(),
	password: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<Account>;

export const createAccountSchema = accountSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const verificationSchema = z.object({
	id: z.string(),
	identifier: z.string(),
	value: z.string(),
	expiresAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
}) satisfies z.ZodType<Verification>;

export const createVerificationSchema = verificationSchema.omit({
	createdAt: true,
	updatedAt: true,
});

export const registerSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8).max(72),
	name: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8).max(72),
});

export const refreshSessionSchema = z.object({
	refreshToken: z.string().min(1),
});

export const logoutSchema = refreshSessionSchema;

export const forgotPasswordSchema = z.object({
	email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8).max(72),
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(8).max(72),
	newPassword: z.string().min(8).max(72),
});

export const requestEmailVerificationSchema = z.object({
	email: z.string().trim().email().optional(),
});

export const verifyEmailSchema = z.object({
	token: z.string().min(1),
});

export const authTokensSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	accessTokenExpiresAt: z.iso.datetime(),
	refreshTokenExpiresAt: z.iso.datetime(),
});

export const authResponseSchema = z.object({
	user: publicUserSchema,
	tokens: authTokensSchema,
});

export type PublicUser = z.infer<typeof publicUserSchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type CreateAccessTokenInput = z.infer<
	typeof createAccessTokenInputSchema
>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RequestEmailVerificationInput = z.infer<
	typeof requestEmailVerificationSchema
>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
