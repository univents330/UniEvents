import "@unievent/env/web";
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Enable PWA features only for production builds.
const withPWA = withPWAInit({
	// Emit service worker files to the public folder at build time.
	dest: "public",
	// Auto-register SW on the client and activate updated SW immediately.
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV !== "production",
	// Keep caching minimal: static assets + network-first for app/data requests.
	runtimeCaching: [
		{
			urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|webp|ico)$/i,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "static-assets",
				expiration: {
					maxEntries: 256,
					maxAgeSeconds: 60 * 60 * 24 * 30,
				},
				cacheableResponse: {
					statuses: [0, 200],
				},
			},
		},
		{
			urlPattern: /^https:\/\/.*/i,
			handler: "NetworkFirst",
			options: {
				cacheName: "https-requests",
				networkTimeoutSeconds: 10,
				expiration: {
					maxEntries: 128,
					maxAgeSeconds: 60 * 60 * 24,
				},
				cacheableResponse: {
					statuses: [0, 200],
				},
			},
		},
	],
});

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
		],
	},
};

export default withPWA(nextConfig);
