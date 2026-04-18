import { dash } from "@better-auth/infra";
import { prisma } from "@voltaze/db";
import { env } from "@voltaze/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmailViaBrevo } from "./brevo";
import { getAllowedCorsOrigins } from "./cors-origins";

const googleProvider =
	env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
		? {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			}
		: undefined;

const DEV_BETTER_AUTH_SECRET = "development-better-auth-secret-change-me-12345";

const authSecret =
	env.BETTER_AUTH_API_KEY ??
	(env.NODE_ENV === "production" ? undefined : DEV_BETTER_AUTH_SECRET);

if (!authSecret) {
	throw new Error("Missing Better Auth secret. Set BETTER_AUTH_API_KEY.");
}

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: authSecret,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	plugins: env.BETTER_AUTH_API_KEY
		? [
				dash({
					apiKey: env.BETTER_AUTH_API_KEY,
				}),
			]
		: [],
	socialProviders: googleProvider
		? {
				google: googleProvider,
			}
		: undefined,
	emailAndPassword: {
		enabled: true,
		sendResetPasswordEmail: async (data) => {
			const resetLink = `${env.BETTER_AUTH_URL}/reset-password?token=${data.token}`;
			await sendEmailViaBrevo({
				to: data.user.email,
				subject: "Reset your Voltaze password",
				htmlContent: `
					<h1>Reset Your Password</h1>
					<p>Click the link below to reset your password:</p>
					<a href="${resetLink}">${resetLink}</a>
					<p>This link will expire in 1 hour.</p>
				`,
				textContent: `Reset your password: ${resetLink}`,
			});
		},
		sendVerificationEmail: async (data) => {
			const verificationLink = `${env.BETTER_AUTH_URL}/verify-email?token=${data.token}`;
			await sendEmailViaBrevo({
				to: data.user.email,
				subject: "Verify your Voltaze email",
				htmlContent: `
					<h1>Verify Your Email</h1>
					<p>Click the link below to verify your email address:</p>
					<a href="${verificationLink}">${verificationLink}</a>
					<p>This link will expire in 24 hours.</p>
				`,
				textContent: `Verify your email: ${verificationLink}`,
			});
		},
	},
	trustedOrigins: getAllowedCorsOrigins(),
	advanced: {
		defaultCookieAttributes: {
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "USER",
				input: false,
			},
		},
	},
});
