import { env } from "@voltaze/env/server";
import {
	accessTokenPayloadSchema,
	createAccessTokenInputSchema,
} from "@voltaze/schema";

const textEncoder = new TextEncoder();

const accessKeyPromise = crypto.subtle.importKey(
	"raw",
	textEncoder.encode(env.JWT_ACCESS_SECRET),
	{ name: "HMAC", hash: "SHA-256" },
	false,
	["sign", "verify"],
);

const refreshKeyPromise = crypto.subtle.importKey(
	"raw",
	textEncoder.encode(env.JWT_REFRESH_SECRET),
	{ name: "HMAC", hash: "SHA-256" },
	false,
	["sign"],
);

function encodeBase64Url(value: string | Uint8Array) {
	return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
	return Buffer.from(value, "base64url");
}

export async function createAccessToken(input: unknown) {
	const parsed = createAccessTokenInputSchema.parse(input);
	const issuedAt = Math.floor(Date.now() / 1000);
	const payload = accessTokenPayloadSchema.parse({
		sub: parsed.userId,
		sessionId: parsed.sessionId,
		email: parsed.email,
		role: parsed.role,
		type: "access",
		iat: issuedAt,
		exp: issuedAt + env.ACCESS_TOKEN_TTL_SECONDS,
		iss: env.AUTH_ISSUER,
	});

	const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const body = encodeBase64Url(JSON.stringify(payload));
	const unsignedToken = `${header}.${body}`;
	const signature = await crypto.subtle.sign(
		"HMAC",
		await accessKeyPromise,
		textEncoder.encode(unsignedToken),
	);

	return {
		token: `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`,
		expiresAt: new Date(payload.exp * 1000),
	};
}

export async function verifyAccessToken(token: string) {
	const [header, payload, signature] = token.split(".");

	if (!header || !payload || !signature) {
		throw new Error("Invalid token structure");
	}

	const unsignedToken = `${header}.${payload}`;
	const isValid = await crypto.subtle.verify(
		"HMAC",
		await accessKeyPromise,
		decodeBase64Url(signature),
		textEncoder.encode(unsignedToken),
	);

	if (!isValid) {
		throw new Error("Invalid token signature");
	}

	const parsedPayload = accessTokenPayloadSchema.parse(
		JSON.parse(decodeBase64Url(payload).toString("utf8")),
	);

	if (parsedPayload.iss !== env.AUTH_ISSUER) {
		throw new Error("Invalid token issuer");
	}

	if (parsedPayload.exp <= Math.floor(Date.now() / 1000)) {
		throw new Error("Token expired");
	}

	return parsedPayload;
}

export async function hashPassword(password: string) {
	return Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
	try {
		return await Bun.password.verify(password, hash);
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			error.code === "PASSWORD_INVALID_ENCODING"
		) {
			return false;
		}

		throw error;
	}
}

export function createRefreshToken() {
	return encodeBase64Url(crypto.getRandomValues(new Uint8Array(48)));
}

export async function hashRefreshToken(token: string) {
	const mac = await crypto.subtle.sign(
		"HMAC",
		await refreshKeyPromise,
		textEncoder.encode(token),
	);
	return Buffer.from(mac).toString("hex");
}

export function createRefreshExpiryDate() {
	return new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000);
}

export function createVerificationToken() {
	return encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashVerificationToken(token: string) {
	const mac = await crypto.subtle.sign(
		"HMAC",
		await refreshKeyPromise,
		textEncoder.encode(token),
	);
	return Buffer.from(mac).toString("hex");
}

const VERIFICATION_TOKEN_TTL_SECONDS = 3600; // 1 hour

export function createVerificationExpiryDate() {
	return new Date(Date.now() + VERIFICATION_TOKEN_TTL_SECONDS * 1000);
}

const PASSWORD_RESET_TOKEN_TTL_SECONDS = 1800; // 30 minutes

export function createPasswordResetExpiryDate() {
	return new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_SECONDS * 1000);
}
