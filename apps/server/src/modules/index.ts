import type { Express } from "express";

import { registerAttendeesModule } from "./attendees";
import { registerAuthModule } from "./auth";
import { registerCheckInsModule } from "./check-ins";
import { registerEventsModule } from "./events";
import { registerOrdersModule } from "./orders";
import { registerPassesModule } from "./passes";
import { registerPaymentsModule } from "./payments";
import { registerTicketsModule } from "./tickets";

export function registerModules(app: Express) {
	registerAuthModule(app);
	registerEventsModule(app);
	registerAttendeesModule(app);
	registerOrdersModule(app);
	registerTicketsModule(app);
	registerPassesModule(app);
	registerCheckInsModule(app);
	registerPaymentsModule(app);
}
