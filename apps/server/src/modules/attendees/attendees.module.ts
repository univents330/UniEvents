import type { Express } from "express";

import { createAttendeesRouter } from "./attendees.router";

export function registerAttendeesModule(app: Express) {
	app.use("/attendees", createAttendeesRouter());
}
