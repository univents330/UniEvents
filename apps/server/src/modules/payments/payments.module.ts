import type { Express } from "express";

import { createPaymentsRouter } from "./payments.router";

export function registerPaymentsModule(app: Express) {
	app.use("/payments", createPaymentsRouter());
}
