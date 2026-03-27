import type { Express } from "express";

import { createPassesRouter } from "./passes.router";

export function registerPassesModule(app: Express) {
	app.use("/passes", createPassesRouter());
}
