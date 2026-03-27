import { createApp } from "./app.module";

export async function bootstrap() {
	const app = createApp();
	const port = Number(process.env.PORT ?? 3000);

	const server = app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});

	const shutdown = (signal: string) => {
		console.log(`${signal} received, shutting down gracefully...`);
		server.close(() => {
			console.log("Server closed");
			process.exit(0);
		});
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));

	return server;
}
