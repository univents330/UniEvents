import type { Express } from "express";

import { createTicketsRouter } from "./tickets.router";

export function registerTicketsModule(app: Express) {
	app.use("/tickets", createTicketsRouter());
}
