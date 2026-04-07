"use client";

import { ChevronDown, Globe, LocateFixed, MapPin, Search } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveLocation } from "@/shared/hooks/use-live-location";
import { Navbar } from "@/shared/ui/navbar";

export function EventHero() {
	const router = useRouter();
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const { location, setLocation, detectLocation, isLocating } = useLiveLocation(
		{
			fallback: "Chandigarh",
		},
	);

	const locationOptions = useMemo(() => {
		const defaults = ["Chandigarh", "Delhi", "Mumbai", "Bangalore"];

		if (
			location &&
			!defaults.some((item) => item.toLowerCase() === location.toLowerCase())
		) {
			return [location, ...defaults];
		}

		return defaults;
	}, [location]);

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.append("search", searchQuery);
		if (location) params.append("location", location);

		router.push(`/events?${params.toString()}`);
		setIsLocationMenuOpen(false);
	};

	const handleUseLiveLocation = async () => {
		await detectLocation();
		setIsLocationMenuOpen(false);
	};

	const handleBrowseOnlineEvents = () => {
		setLocation("Online");
		const params = new URLSearchParams();

		if (searchQuery) params.set("search", searchQuery);
		params.set("location", "online");

		router.push(`/events?${params.toString()}`);
		setIsLocationMenuOpen(false);
	};

	const handlePickLocation = (value: string) => {
		setLocation(value);
		setIsLocationMenuOpen(false);
	};

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (!locationMenuRef.current?.contains(target)) {
				setIsLocationMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	const handleDiscoverEvents = () => {
		router.push("/events");
	};

	return (
		<div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center bg-[#EBF3FF]">
			<Navbar />

			<main className="flex w-full flex-1 items-center justify-center">
				<div className="w-full max-w-6xl px-6 py-24 md:py-32">
					<div className="flex flex-col items-center gap-3 text-center">
						<h1 className="font-extrabold text-4xl text-black leading-tight tracking-tighter md:text-8xl">
							Discover and Book
						</h1>

						<h2 className="mt-3 font-extrabold text-3xl text-[#030370] leading-[0.95] tracking-tighter md:text-7xl">
							Events Effortlessly
						</h2>

						<p className="mt-4 max-w-2xl px-4 font-semibold text-[#6B7280] text-base leading-relaxed md:text-xl">
							From Front Row Fan To Sold Out Host
							<br />
							Everything You Need To Live And Lead The Experience.
						</p>

						<Button
							onClick={handleDiscoverEvents}
							size="lg"
							className="mt-6 h-14 rounded-full bg-[#030370] px-10 font-bold text-white shadow-[0_0_10px_0_rgba(71,114,230,1)] transition-transform hover:-translate-y-0.5 hover:bg-[#030370]/90"
						>
							Discover Events
						</Button>

						<div className="mt-8 flex w-full justify-center">
							<div className="w-full max-w-4xl rounded-full border border-gray-100 bg-white p-2 shadow-2xl">
								<div className="flex items-center">
									<div className="flex flex-1 items-center gap-3 px-4">
										<Search
											size={22}
											className="shrink-0 text-slate-700"
											strokeWidth={2}
										/>
										<Input
											type="text"
											placeholder="Search For Events Near You"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSearch();
											}}
											className="h-auto border-none bg-transparent p-0 font-medium text-gray-700 text-lg shadow-none focus-visible:ring-0"
										/>
									</div>

									<div className="hidden h-10 w-px bg-gray-200 md:block" />

									<div
										ref={locationMenuRef}
										className="relative hidden items-center gap-3 px-6 md:flex"
									>
										<button
											type="button"
											onClick={() => setIsLocationMenuOpen((prev) => !prev)}
											className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
											aria-expanded={isLocationMenuOpen}
											aria-label="Open location menu"
										>
											<MapPin
												size={20}
												className="shrink-0 text-slate-700"
												strokeWidth={2}
											/>
											<span className="w-32 truncate text-left font-medium text-base text-gray-700">
												{location || "Select location"}
											</span>
											<ChevronDown
												className={`h-4 w-4 text-slate-500 transition-transform ${
													isLocationMenuOpen ? "rotate-180" : "rotate-0"
												}`}
											/>
										</button>

										<div
											className={`absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(7,1,144,0.16)] transition-all ${
												isLocationMenuOpen
													? "pointer-events-auto translate-y-0 opacity-100"
													: "pointer-events-none -translate-y-1 opacity-0"
											}`}
										>
											<button
												type="button"
												onClick={handleUseLiveLocation}
												disabled={isLocating}
												className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[#070190] text-sm transition-colors hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-70"
											>
												<LocateFixed className="h-4 w-4" />
												{isLocating
													? "Fetching live location..."
													: "Fetch live location"}
											</button>

											<button
												type="button"
												onClick={handleBrowseOnlineEvents}
												className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[#070190] text-sm transition-colors hover:bg-[#f4f6ff]"
											>
												<Globe className="h-4 w-4" />
												Browse online events
											</button>

											<div className="my-1 border-slate-100 border-t" />
											<p className="px-3 py-1 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
												Popular cities
											</p>

											{locationOptions.map((option) => (
												<button
													key={option.toLowerCase()}
													type="button"
													onClick={() => handlePickLocation(option)}
													className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
												>
													<MapPin className="h-3.5 w-3.5" />
													{option}
												</button>
											))}
										</div>
									</div>

									<div className="md:px-4">
										<Button
											onClick={handleSearch}
											className="h-12 rounded-full bg-[#030370] px-8 font-bold text-white shadow-[0_0_10px_0_rgba(71,114,230,1)] transition-opacity hover:bg-[#030370]/90 hover:opacity-90 active:scale-95"
										>
											Search
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
