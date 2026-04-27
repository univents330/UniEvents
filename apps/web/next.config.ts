import "@unievent/env/web";
import type { NextConfig } from "next";

const allowedDevOrigins = (
	process.env.NEXT_ALLOWED_DEV_ORIGINS ??
	[
		"64.227.189.240",
		"64.227.189.240:3001",
		"http://64.227.189.240",
		"http://64.227.189.240:3001",
		"https://64.227.189.240",
		"https://64.227.189.240:3001",
	].join(",")
)
	.split(",")
	.map((value) => value.trim())
	.filter(Boolean);

const nextConfig: NextConfig = {
	typedRoutes: false,
	allowedDevOrigins,
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
			{
				protocol: "https",
				hostname: "picsum.photos",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
			{
				protocol: "https",
				hostname: "i.pravatar.cc",
			},
		],
	},
};

export default nextConfig;
