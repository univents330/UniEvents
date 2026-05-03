import { env } from "@unievent/env/web";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/dashboard/", "/api/", "/auth/"],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
