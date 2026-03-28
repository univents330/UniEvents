import { prisma, type UserRole } from "@voltaze/db";
import type { RequestHandler } from "express";
import { verifyAccessToken } from "@/modules/auth/auth.utils";
import { ForbiddenError, UnauthorizedError } from "../exceptions/app-error";
import type { RequestWithAuth } from "../types/auth-request";

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

export const requireAuth: RequestHandler = async (req, _res, next) => {
	try {
		const authReq = req as RequestWithAuth;
		const token = getBearerToken(req.get("authorization"));
		if (!token) {
			throw new UnauthorizedError("Missing bearer token");
		}

		const payload = await verifyAccessToken(token);
		const session = await prisma.session.findUnique({
			where: { id: payload.sessionId },
			include: { user: true },
		});

		if (!session || session.userId !== payload.sub) {
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

		next();
	} catch (error) {
		next(
			error instanceof UnauthorizedError
				? error
				: new UnauthorizedError("Invalid or expired access token"),
		);
	}
};

export function requireRoles(...roles: UserRole[]): RequestHandler {
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
