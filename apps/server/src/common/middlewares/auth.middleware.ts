import { prisma } from "@unievent/db";
import { type AuthUserRole, userRoleSchema } from "@unievent/schema";
import { fromNodeHeaders } from "better-auth/node";
import type { RequestHandler } from "express";
import { auth } from "@/common/utils/better-auth";
import { ForbiddenError, UnauthorizedError } from "../exceptions/app-error";
import type { RequestWithAuth } from "../types/auth-request";

function normalizeRole(role: unknown): AuthUserRole {
	const parsed = userRoleSchema.safeParse(role);
	if (parsed.success) {
		return parsed.data;
	}

	return "USER";
}

function getBearerToken(authorizationHeader?: string) {
	if (!authorizationHeader) {
		return null;
	}

	const [scheme, token] = authorizationHeader.split(" ");
	if (scheme?.toLowerCase() !== "bearer" || !token) {
		return null;
	}

	return token;
}

async function attachBearerSessionContext(
	authReq: RequestWithAuth,
	token: string,
) {
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

	authReq.auth = {
		userId: session.user.id,
		sessionId: session.id,
		email: session.user.email,
		role: session.user.role,
	};
	authReq.user = session.user;
}

async function attachBetterAuthContext(authReq: RequestWithAuth) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(authReq.headers),
	});

	if (!session) {
		return false;
	}

	authReq.auth = {
		userId: session.user.id,
		sessionId: session.session.id,
		email: session.user.email,
		role: normalizeRole(session.user.role),
	};
	authReq.user = session.user as typeof authReq.user;
	return true;
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
	try {
		const authReq = req as RequestWithAuth;
		if (await attachBetterAuthContext(authReq)) {
			return next();
		}

		const token = getBearerToken(req.get("authorization"));
		if (!token) {
			throw new UnauthorizedError("Missing bearer token");
		}

		await attachBearerSessionContext(authReq, token);

		next();
	} catch (error) {
		next(
			error instanceof UnauthorizedError
				? error
				: new UnauthorizedError("Invalid or expired access token"),
		);
	}
};

export const optionalAuth: RequestHandler = async (req, _res, next) => {
	const authReq = req as RequestWithAuth;
	if (await attachBetterAuthContext(authReq)) {
		return next();
	}
	const token = getBearerToken(req.get("authorization"));

	if (!token) {
		return next();
	}

	try {
		await attachBearerSessionContext(authReq, token);
	} catch {
		authReq.auth = undefined;
		authReq.user = undefined;
	}

	next();
};

export function requireRoles(...roles: AuthUserRole[]): RequestHandler {
	return (req, _res, next) => {
		const authReq = req as RequestWithAuth;

		if (!authReq.user || !authReq.auth) {
			return next(new UnauthorizedError("Authentication required"));
		}

		if (!roles.includes(authReq.user.role)) {
			return next(
				new ForbiddenError("You do not have access to this resource"),
			);
		}

		next();
	};
}
