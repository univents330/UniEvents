import type { Express } from "express";

import { createCheckInsRouter } from "./check-ins.router";

export function registerCheckInsModule(app: Express) {
	app.use("/check-ins", createCheckInsRouter());
}
