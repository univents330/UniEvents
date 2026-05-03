import type { Express } from "express";

import { createNotificationsRouter } from "./notifications.router";

export function registerNotificationsModule(app: Express) {
	app.use("/notifications", createNotificationsRouter());
}
