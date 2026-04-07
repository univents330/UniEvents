"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	TOP_LOADER_DONE_EVENT,
	TOP_LOADER_START_EVENT,
} from "@/shared/lib/top-loader-events";

const NAVBAR_HEIGHT_PX = 64;
const MIN_VISIBLE_MS = 220;
const HIDE_DELAY_MS = 120;
const RENDER_SETTLE_DELAY_MS = 140;

export function TopLoader() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isVisible, setIsVisible] = useState(false);
	const [progress, setProgress] = useState(0);
	const startTimestampRef = useRef<number>(0);
	const hideTimeoutRef = useRef<number | null>(null);
	const renderSettleTimeoutRef = useRef<number | null>(null);

	const clearHideTimer = () => {
		if (hideTimeoutRef.current) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
	};

	const clearRenderSettleTimer = () => {
		if (renderSettleTimeoutRef.current) {
			window.clearTimeout(renderSettleTimeoutRef.current);
			renderSettleTimeoutRef.current = null;
		}
	};

	const start = () => {
		clearRenderSettleTimer();
		clearHideTimer();
		startTimestampRef.current = Date.now();
		setIsVisible(true);
		setProgress((current) => (current > 18 ? current : 18));
	};

	const stop = () => {
		if (!isVisible) {
			return;
		}

		const elapsed = Date.now() - startTimestampRef.current;
		const waitFor = Math.max(0, MIN_VISIBLE_MS - elapsed);

		clearRenderSettleTimer();
		clearHideTimer();
		hideTimeoutRef.current = window.setTimeout(() => {
			setProgress(100);
			hideTimeoutRef.current = window.setTimeout(() => {
				setIsVisible(false);
				setProgress(0);
				hideTimeoutRef.current = null;
			}, HIDE_DELAY_MS);
		}, waitFor);
	};

	useEffect(() => {
		if (!isVisible) {
			return;
		}

		const timer = window.setInterval(() => {
			setProgress((current) => {
				if (current >= 92) {
					return current;
				}

				const next = current + Math.max(1.2, (95 - current) * 0.08);
				return Math.min(next, 92);
			});
		}, 120);

		return () => {
			window.clearInterval(timer);
		};
	}, [isVisible]);

	useEffect(() => {
		const handleStart = () => start();
		const handleStop = () => stop();

		window.addEventListener(TOP_LOADER_START_EVENT, handleStart);
		window.addEventListener(TOP_LOADER_DONE_EVENT, handleStop);

		return () => {
			window.removeEventListener(TOP_LOADER_START_EVENT, handleStart);
			window.removeEventListener(TOP_LOADER_DONE_EVENT, handleStop);
		};
	}, [isVisible]);

	useEffect(() => {
		if (isVisible) {
			clearRenderSettleTimer();
			renderSettleTimeoutRef.current = window.setTimeout(() => {
				stop();
			}, RENDER_SETTLE_DELAY_MS);
		}
	}, [pathname, searchParams, isVisible]);

	useEffect(() => {
		const handleDocumentClick = (event: MouseEvent) => {
			if (event.defaultPrevented || event.button !== 0) {
				return;
			}

			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
				return;
			}

			const target = event.target as HTMLElement | null;
			const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
			if (!anchor) {
				return;
			}

			if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
				return;
			}

			const destination = new URL(anchor.href, window.location.href);
			if (destination.origin !== window.location.origin) {
				return;
			}

			const current = `${window.location.pathname}${window.location.search}`;
			const next = `${destination.pathname}${destination.search}`;

			if (current !== next) {
				start();
			}
		};

		document.addEventListener("click", handleDocumentClick, true);
		return () => {
			document.removeEventListener("click", handleDocumentClick, true);
		};
	}, []);

	useEffect(() => {
		const handlePopState = () => {
			start();
		};

		window.addEventListener("popstate", handlePopState);
		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	useEffect(() => {
		return () => {
			clearRenderSettleTimer();
			clearHideTimer();
		};
	}, []);

	return (
		<div
			aria-hidden="true"
			className={`pointer-events-none fixed right-0 left-0 z-60 h-0.75 transition-opacity duration-200 ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}
			style={{ top: NAVBAR_HEIGHT_PX }}
		>
			<div
				className="h-full origin-left bg-[#030370] shadow-[0_0_10px_rgba(3,3,112,0.45)]"
				style={{
					transform: `scaleX(${Math.max(progress, 0) / 100})`,
					transition: "transform 180ms ease-out",
					willChange: "transform",
				}}
			/>
		</div>
	);
}
