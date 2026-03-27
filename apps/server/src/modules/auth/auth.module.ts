import type { Express } from "express";

import { createAuthRouter } from "./auth.router";

export function registerAuthModule(app: Express) {
	app.use("/auth", createAuthRouter());
}
