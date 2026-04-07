import "@voltaze/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
};

export default nextConfig;
