import type { Account, Session, User, Verification } from "@voltaze/db";
import { z } from "zod";

export type { Account, Session, User, Verification };

const ulidSchema = z
	.string()
	.regex(/^[0-9A-HJKMNP-TV-Z]{26}$/i, "Invalid ULID");

const userRoleSchema = z.enum(["ADMIN", "HOST", "USER"]);

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
	id: true,
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

export const authTokensSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	accessTokenExpiresAt: z.string().datetime(),
	refreshTokenExpiresAt: z.string().datetime(),
});

export const authResponseSchema = z.object({
	user: userSchema,
	tokens: authTokensSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
