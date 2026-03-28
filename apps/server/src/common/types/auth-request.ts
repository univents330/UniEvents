import type { User, UserRole } from "@voltaze/db";
import type { Request } from "express";

export type RequestAuthContext = {
	userId: string;
	sessionId: string;
	email: string;
	role: UserRole;
};

export type RequestWithAuth = Request & {
	auth?: RequestAuthContext;
	user?: User;
};

export type AuthenticatedRequest = Request & {
	auth: RequestAuthContext;
	user?: User;
};
