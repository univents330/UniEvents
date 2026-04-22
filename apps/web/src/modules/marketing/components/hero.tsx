"use client";

import {
	ChevronDown,
	Crosshair,
	Globe,
	Loader2,
	MapPin,
	Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/cn";

const POPULAR_CITIES = ["Kharar", "Chandigarh", "Delhi", "Mumbai", "Bangalore"];

export function Hero() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const [location, setLocation] = useState("Kharar");
	const [isFetchingLocation, setIsFetchingLocation] = useState(false);
	const locationMenuRef = useRef<HTMLDivElement | null>(null);

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.append("search", searchQuery);
		if (location && location !== "All Locations")
			params.append("location", location);
		router.push(`/events?${params.toString()}`);
		setIsLocationMenuOpen(false);
	};

	const handlePickLocation = (value: string) => {
		setLocation(value);
		setIsLocationMenuOpen(false);
	};

	const handleFetchLocation = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser.");
			return;
		}

		setIsFetchingLocation(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const response = await fetch(
						`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
					);
					const data = await response.json();
					setLocation(data.city || data.locality || "Near Me");
				} catch (error) {
					console.error("Error fetching location name:", error);
					setLocation("Current Location");
				} finally {
					setIsFetchingLocation(false);
					setIsLocationMenuOpen(false);
				}
			},
			(error) => {
				console.error("Error getting location:", error);
				setIsFetchingLocation(false);
				alert("Unable to retrieve your location.");
			},
			{ timeout: 10000 },
		);
	};

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (
				locationMenuRef.current &&
				!locationMenuRef.current.contains(event.target as Node)
			) {
				setIsLocationMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	return (
		<section className="relative flex min-h-screen w-full flex-col items-center justify-center py-20 md:py-32">
			{/* Dynamic Background Elements */}
			<div className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden">
				<div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] animate-pulse rounded-full bg-blue-400/10 blur-[120px]" />
				<div className="absolute right-[-5%] bottom-[-10%] h-[500px] w-[500px] animate-pulse rounded-full bg-indigo-400/10 blur-[120px]" />
			</div>

			<div className="mx-auto w-full max-w-[1440px] px-6">
				<div className="relative z-10 flex flex-col items-center gap-8 text-center">
					{/* Typography Section */}
					<div className="fade-in slide-in-from-bottom-10 max-w-4xl animate-in space-y-4 duration-1000">
						<h1 className="display-font font-black text-4xl text-slate-900 leading-[1.05] tracking-tighter sm:text-7xl md:text-8xl">
							The ultimate way to <br className="hidden md:block" />
							<span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
								discover experiences.
							</span>
						</h1>
						<p className="mx-auto max-w-2xl font-bold text-lg text-slate-400 leading-relaxed md:text-xl">
							Secure tickets for the hottest events on campus.{" "}
							<br className="hidden sm:block" />
							Built for the next generation of event-goers.
						</p>
					</div>

					{/* World-Class Search Interface */}
					<div className="fade-in slide-in-from-bottom-12 w-full max-w-5xl animate-in delay-300 duration-1000">
						<div className="relative rounded-[32px] bg-white p-2 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 transition-all hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.12)] md:rounded-full">
							<div className="flex flex-col md:flex-row md:items-center">
								{/* Search Query Area */}
								<div className="flex flex-1 items-center gap-4 border-slate-100 border-b px-6 py-3 md:border-r md:border-b-0 md:py-0">
									<Search
										size={22}
										className="text-slate-400"
										strokeWidth={2.5}
									/>
									<input
										type="text"
										placeholder="Search events, artists..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="h-10 w-full border-none bg-transparent font-black text-lg text-slate-900 outline-none placeholder:font-bold placeholder:text-slate-300"
									/>
								</div>

								{/* Location Picker Area */}
								<div
									className="relative flex-none px-2 py-3 md:py-0"
									ref={locationMenuRef}
								>
									<button
										type="button"
										onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
										className={cn(
											"flex w-full items-center justify-between gap-3 rounded-2xl px-6 py-3 transition-all md:w-auto md:rounded-full",
											isLocationMenuOpen
												? "bg-slate-50 shadow-inner"
												: "hover:bg-slate-50",
										)}
									>
										<div className="flex min-w-[120px] items-center gap-3">
											{isFetchingLocation ? (
												<Loader2
													size={18}
													className="animate-spin text-blue-600"
												/>
											) : (
												<MapPin
													size={18}
													className="text-blue-600"
													strokeWidth={2.5}
												/>
											)}
											<span className="truncate font-black text-base text-slate-900">
												{location}
											</span>
										</div>
										<ChevronDown
											size={16}
											className={cn(
												"text-slate-400 transition-transform duration-300",
												isLocationMenuOpen && "rotate-180",
											)}
										/>
									</button>

									{/* High-Fidelity Dropdown */}
									{isLocationMenuOpen && (
										<div className="fade-in zoom-in-95 absolute top-full right-0 left-0 z-[100] mt-4 w-full origin-top animate-in rounded-[32px] border border-slate-100 bg-white p-2 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.25)] duration-200 md:left-auto md:w-80">
											<div className="space-y-1">
												<button
													type="button"
													onClick={handleFetchLocation}
													disabled={isFetchingLocation}
													className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left font-black text-blue-600 transition-all hover:bg-blue-50/50 active:scale-[0.98] disabled:opacity-50"
												>
													<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
														<Crosshair size={20} />
													</div>
													<div className="flex flex-col overflow-hidden">
														<span className="truncate font-black text-sm">
															Fetch live location
														</span>
														<span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider">
															Use browser GPS
														</span>
													</div>
												</button>

												<button
													type="button"
													onClick={() => handlePickLocation("Online")}
													className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left font-black text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
												>
													<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
														<Globe size={20} />
													</div>
													<div className="flex flex-col overflow-hidden">
														<span className="truncate font-black text-sm">
															Browse online events
														</span>
														<span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider">
															Virtual & Remote
														</span>
													</div>
												</button>
											</div>

											<div className="my-3 flex items-center gap-4 px-4">
												<div className="h-px flex-1 bg-slate-50" />
												<span className="font-black text-[9px] text-slate-300 uppercase tracking-[0.2em]">
													Popular cities
												</span>
												<div className="h-px flex-1 bg-slate-50" />
											</div>

											<div className="max-h-[300px] overflow-y-auto pr-1">
												<div className="grid grid-cols-1 gap-0.5">
													{POPULAR_CITIES.map((city) => (
														<button
															type="button"
															key={city}
															onClick={() => handlePickLocation(city)}
															className="group flex w-full items-center gap-4 rounded-2xl px-4 py-2.5 text-left font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600"
														>
															<MapPin
																size={16}
																className="text-slate-300 transition-colors group-hover:text-blue-500"
															/>
															<span className="text-[15px]">{city}</span>
														</button>
													))}
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Final Action Area */}
								<div className="p-2 md:p-1">
									<button
										type="button"
										onClick={handleSearch}
										className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#000066] px-10 font-black text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-[#000044] active:scale-[0.98] md:rounded-full"
									>
										<span className="relative z-10">Search</span>
										<div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
											<Search size={14} strokeWidth={3} />
										</div>
										<div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0 opacity-0 transition-opacity transition-transform duration-700 group-hover:translate-x-full group-hover:opacity-100" />
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Floating Badges */}
					<div className="mt-4 flex flex-wrap justify-center gap-3 opacity-60">
						{["Music", "Workshops", "Hackathons", "Meetups"].map((tag) => (
							<span
								key={tag}
								className="rounded-full border border-slate-200 px-4 py-1.5 font-black text-slate-500 text-xs uppercase tracking-widest"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
