import { env } from "@unievent/env/web";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${baseUrl}/events`,
			lastModified: new Date(),
			changeFrequency: "always",
			priority: 0.8,
		},
	];
}
