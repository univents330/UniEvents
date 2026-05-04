declare module "next-pwa" {
	import type { NextConfig } from "next";

	export interface PWAConfig {
		dest?: string;
		disable?: boolean;
		register?: boolean;
		scope?: string;
		sw?: string;
		cacheOnFrontEndNav?: boolean;
		reloadOnOnline?: boolean;
		skipWaiting?: boolean;
		dynamicStartUrl?: boolean;
		dynamicStartUrlRedirect?: string;
		buildExcludes?: unknown[];
		publicExcludes?: string[];
		entitlements?: string[];
		runtimeCaching?: unknown[];
		fallbacks?: unknown;
		cacheId?: string;
		cleanupOutdatedCaches?: boolean;
		dbName?: string;
		importScripts?: string[];
		inlineWorkboxRuntime?: boolean;
		onRecoverableError?: (error: unknown) => void;
	}

	function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

	export default withPWA;
}
