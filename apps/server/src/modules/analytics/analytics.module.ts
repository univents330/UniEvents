import type { Express } from "express";

import { createAnalyticsRouter } from "./analytics.router";

export function registerAnalyticsModule(app: Express) {
	app.use("/analytics", createAnalyticsRouter());
}
