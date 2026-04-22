import type { Account, Session, User, Verification } from "@unievent/db";
import { z } from "zod";

export type { Account, Session, User, Verification };

const ulidSchema = z.string().min(10);

export const userRoleSchema = z.enum(["ADMIN", "HOST", "USER"]);

export const userSchema = z.object({
	id: ulidSchema,
	name: z.string().nullable(),
	email: z.string().email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	role: userRoleSchema,
	skills: z.array(z.string()).default([]),
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
	skills: true,
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
		skills: z.array(z.string()).max(5).optional(),
	});

// Profile update — only the fields a user can change about themselves
export const updateProfileSchema = z.object({
	name: z.string().trim().min(1).max(100).nullable().optional(),
	image: z.string().url().nullable().optional(),
	skills: z.array(z.string().trim().min(1).max(60)).max(10).optional(),
});

// Admin update — can update profile fields plus the user's role
export const adminUpdateUserSchema = updateProfileSchema.extend({
	role: userRoleSchema.optional(),
});

export const userFilterSchema = z.object({
	role: userRoleSchema.optional(),
	search: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	sortBy: z.enum(["createdAt", "name"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
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

export const hostModeSchema = z.object({
	enabled: z.boolean(),
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

export type AuthUserRole = z.infer<typeof userRoleSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type AuthRequestContext = z.infer<typeof authRequestContextSchema>;
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
export type HostModeInput = z.infer<typeof hostModeSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
