import type { User, UserRole } from "@voltaze/db";

declare module "express-serve-static-core" {
	interface Request {
		requestId?: string;
		auth?: {
			userId: string;
			sessionId: string;
			email: string;
			role: UserRole;
		};
		user?: User;
	}
}
