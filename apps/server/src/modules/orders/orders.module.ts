import type { Express } from "express";

import { createOrdersRouter } from "./orders.router";

export function registerOrdersModule(app: Express) {
	app.use("/orders", createOrdersRouter());
}
