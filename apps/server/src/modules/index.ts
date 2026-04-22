import type { Express } from "express";
import { registerAnalyticsModule } from "./analytics";
import { registerAttendeesModule } from "./attendees";
import { registerAuthModule } from "./auth";
import { registerCheckInsModule } from "./check-ins";
import { registerEventsModule } from "./events";
import { registerNotificationsModule } from "./notifications";
import { registerOrdersModule } from "./orders";
import { registerPassesModule } from "./passes";
import { registerPaymentsModule } from "./payments";
import { registerTicketsModule } from "./tickets";
import { registerUsersModule } from "./users";

export function registerModules(app: Express) {
	registerAuthModule(app);
	registerUsersModule(app);
	registerEventsModule(app);
	registerAttendeesModule(app);
	registerOrdersModule(app);
	registerTicketsModule(app);
	registerPassesModule(app);
	registerCheckInsModule(app);
	registerPaymentsModule(app);
	registerAnalyticsModule(app);
	registerNotificationsModule(app);
}
