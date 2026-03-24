import { env } from "@voltaze/env/server";
import cors from "cors";
import express from "express";
import eventRouter from "./routes/event_routes";
import passRouter from "./routes/pass_routes";
import ticketRouter from "./routes/ticket_routes";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json());

app.use("/api", ticketRouter);
app.use("/api", eventRouter);
app.use("/api", passRouter);

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
