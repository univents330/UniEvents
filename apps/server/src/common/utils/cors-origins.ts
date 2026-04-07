import { env } from "@voltaze/env/server";

export function getAllowedCorsOrigins() {
	return env.CORS_ORIGIN.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);
}
