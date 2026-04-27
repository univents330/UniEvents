import type { Express } from "express";
import { createUsersRouter } from "./users.router";

export function registerUsersModule(app: Express) {
	app.use("/users", createUsersRouter());
}
