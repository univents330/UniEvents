import { dash } from "@better-auth/infra";
import { prisma } from "@unievent/db";
import { env } from "@unievent/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { GoogleProfile } from "better-auth/social-providers";
import { sendEmailViaBrevo } from "./brevo";
import { getAllowedCorsOrigins } from "./cors-origins";
import { renderAuthEmail } from "./mail-templates";

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
		enabled: true,
		sendResetPassword: async (data: BetterAuthEmailHookPayload) => {
			const resetLink = data.url;
			await sendEmailViaBrevo({
				to: data.user.email,
				subject: "Reset your UniEvent password",
				htmlContent: renderAuthEmail({
					title: "PASSWORD<br/>RESET.",
					description:
						"The system has received a request to authorize a password override for your account. Click the button below to initiate the reset protocol.",
					buttonText: "Reset Password",
					link: resetLink,
				}),
				textContent: `Reset your UniEvent password by visiting: ${resetLink}`,
			});
		},
	},
	emailVerification: {
		sendVerificationEmail: async (data: BetterAuthEmailHookPayload) => {
			const verificationLink = data.url;
			await sendEmailViaBrevo({
				to: data.user.email,
				subject: "Verify your UniEvent email address",
				htmlContent: renderAuthEmail({
					title: "IDENTITY<br/>VERIFICATION.",
					description:
						"To finalize your registration and activate your operational dashboard, please verify your email address using the secure link below.",
					buttonText: "Verify Email",
					link: verificationLink,
				}),
				textContent: `Verify your UniEvent email by visiting: ${verificationLink}`,
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
			domain: isProduction ? env.AUTH_COOKIE_DOMAIN : undefined,
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
