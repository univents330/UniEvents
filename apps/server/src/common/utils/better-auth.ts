import { dash } from "@better-auth/infra";
import { prisma } from "@unievent/db";
import { env } from "@unievent/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { GoogleProfile } from "better-auth/social-providers";
import { sendEmailViaBrevo } from "./brevo";
import { getAllowedCorsOrigins } from "./cors-origins";

type BetterAuthEmailHookPayload = {
	user: {
		email: string;
	};
	token: string;
	url: string;
};

const googleProvider =
	env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
		? {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				mapProfileToUser: (profile: GoogleProfile) => ({
					image:
						typeof profile.picture === "string" ? profile.picture : undefined,
				}),
			}
		: undefined;

const DEV_BETTER_AUTH_SECRET = "development-better-auth-secret-change-me-12345";

const authSecret =
	env.BETTER_AUTH_API_KEY ??
	(env.NODE_ENV === "production" ? undefined : DEV_BETTER_AUTH_SECRET);

if (!authSecret) {
	throw new Error("Missing Better Auth secret. Set BETTER_AUTH_API_KEY.");
}

const isProduction = env.NODE_ENV === "production";

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
		enabled: false,
		sendResetPassword: async (data: BetterAuthEmailHookPayload) => {
			const resetLink = data.url;
			await sendEmailViaBrevo({
				to: data.user.email,
				subject: "Reset your UniEvent password",
				htmlContent: `
					<h1>Reset Your Password</h1>
					<p>Click the link below to reset your password:</p>
					<a href="${resetLink}">${resetLink}</a>
					<p>This link will expire in 1 hour.</p>
				`,
				textContent: `Reset your password: ${resetLink}`,
			});
		},
	},
	emailVerification: {
		sendVerificationEmail: async (data: BetterAuthEmailHookPayload) => {
			const verificationLink = data.url;
			await sendEmailViaBrevo({
				to: data.user.email,
				subject: "Verify your UniEvent email",
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
			// Cross-origin OAuth requires SameSite=None in production.
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction,
			path: "/",
			domain: env.AUTH_COOKIE_DOMAIN,
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
