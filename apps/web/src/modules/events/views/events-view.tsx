"use client";

import { ChevronRight, Hash, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/core/lib/cn";
import { EventCard } from "../components/event-card";
import { useEvents } from "../hooks/use-events";

const modeFilters = ["ALL", "ONLINE", "OFFLINE"] as const;
const typeFilters = ["ALL", "FREE", "PAID"] as const;

type ModeFilter = (typeof modeFilters)[number];
type TypeFilter = (typeof typeFilters)[number];
type SortOption = "SOONEST" | "LATEST" | "ALPHA";

export function EventsView() {
	const eventsQuery = useEvents({ limit: 100 });

	const [query, setQuery] = useState("");
	const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");
	const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
	const [sortBy, setSortBy] = useState<SortOption>("SOONEST");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 100);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const events = eventsQuery.data?.data ?? [];

	const filteredEvents = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		const baseResults = events.filter((event) => {
			const matchesQuery =
				normalizedQuery.length === 0 ||
				[event.name, event.venueName, event.description]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);
			const matchesMode = modeFilter === "ALL" || event.mode === modeFilter;
			const matchesType = typeFilter === "ALL" || event.type === typeFilter;

			return matchesQuery && matchesMode && matchesType;
		});

		return [...baseResults].sort((a, b) => {
			if (sortBy === "LATEST") {
				return (
					new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
				);
			}
			if (sortBy === "ALPHA") {
				return a.name.localeCompare(b.name);
			}
			return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
		});
	}, [events, query, modeFilter, typeFilter, sortBy]);

	return (
		<div className="relative min-h-screen bg-white font-jakarta">
			{/* Structural Grid Background - Persistent & Professional */}
			<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.03]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(#0000CC 1px, transparent 1px), linear-gradient(90deg, #0000CC 1px, transparent 1px)",
						backgroundSize: "80px 80px",
					}}
				/>
			</div>

			{/* Refined Page Header */}
			<section className="relative z-10 pt-40 pb-16">
				<div className="container mx-auto px-6">
					<div className="max-w-4xl">
						<div className="mb-6 flex items-center gap-3">
							<div className="h-[1px] w-12 bg-blue-600" />
							<span className="font-black text-[11px] text-blue-600 uppercase tracking-[0.3em]">
								Events Directory
							</span>
						</div>
						<h1 className="mb-4 font-black text-6xl text-[#000031] leading-[0.95] tracking-tight md:text-7xl">
							Discover <span className="text-slate-300">the</span> <br />
							Upcoming events
						</h1>
						<p className="mt-8 max-w-2xl font-bold text-slate-400 text-xl leading-relaxed">
							A curated selection of the most anticipated university events,
							technical workshops, and social gatherings.
						</p>
					</div>
				</div>
			</section>

			{/* Precision Search & Filtering System */}
			<div
				className={cn(
					"sticky top-20 z-40 transition-all duration-500",
					scrolled ? "py-4" : "py-8",
				)}
			>
				<div className="container mx-auto px-6">
					<div className="relative flex flex-col items-stretch gap-3 rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
						{/* Search Input - Clean & Focused */}
						<div className="flex flex-1 items-center gap-4 border-slate-50 border-r px-6">
							<Search size={18} className="text-slate-400" />
							<input
								type="text"
								placeholder="Search name, venue, or artist..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="h-12 w-full border-none bg-transparent font-bold text-base text-slate-900 outline-none placeholder:text-slate-300"
							/>
						</div>

						{/* Quick Filters */}
						<div className="flex items-center gap-2 pr-2">
							<div className="mr-2 hidden items-center gap-1 border-slate-50 border-r px-4 lg:flex">
								<p className="mr-4 font-black text-[10px] text-slate-300 uppercase tracking-widest">
									Filter by
								</p>
								<select
									value={modeFilter}
									onChange={(e) => setModeFilter(e.target.value as ModeFilter)}
									className="cursor-pointer bg-transparent font-black text-slate-900 text-xs outline-none transition-colors hover:text-blue-600"
								>
									{modeFilters.map((m) => (
										<option key={m} value={m}>
											{m === "ALL" ? "ALL MODES" : m}
										</option>
									))}
								</select>
								<div className="mx-4 h-4 w-[1px] bg-slate-100" />
								<select
									value={typeFilter}
									onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
									className="cursor-pointer bg-transparent font-black text-slate-900 text-xs outline-none transition-colors hover:text-blue-600"
								>
									{typeFilters.map((t) => (
										<option key={t} value={t}>
											{t === "ALL" ? "ALL ACCESS" : t}
										</option>
									))}
								</select>
							</div>

							<button
								type="button"
								onClick={() => setIsFilterOpen(!isFilterOpen)}
								className={cn(
									"flex h-12 items-center gap-3 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest transition-all",
									isFilterOpen
										? "bg-[#000031] text-white"
										: "bg-slate-50 text-slate-500 hover:bg-slate-100",
								)}
							>
								<SlidersHorizontal size={14} />
								Advanced
							</button>
						</div>

						{/* Advanced Panel Overlay */}
						{isFilterOpen && (
							<div className="fade-in slide-in-from-top-2 absolute top-full right-0 left-0 mt-3 animate-in rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] duration-300">
								<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
									<div className="space-y-6">
										<h4 className="font-black text-[10px] text-blue-600 uppercase tracking-[0.2em]">
											Sort & Arrangement
										</h4>
										<div className="space-y-2">
											{["SOONEST", "LATEST", "ALPHA"].map((opt) => (
												<button
													key={opt}
													type="button"
													onClick={() => setSortBy(opt as SortOption)}
													className={cn(
														"flex w-full items-center justify-between rounded-xl px-4 py-3 font-bold text-xs transition-all",
														sortBy === opt
															? "bg-blue-50 text-blue-700"
															: "text-slate-500 hover:bg-slate-50",
													)}
												>
													{opt === "SOONEST"
														? "Chronological (Soonest)"
														: opt === "LATEST"
															? "Recently Added"
															: "Alphabetical (A-Z)"}
													{sortBy === opt && (
														<div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
													)}
												</button>
											))}
										</div>
									</div>

									<div className="space-y-6 md:col-span-2">
										<h4 className="font-black text-[10px] text-blue-600 uppercase tracking-[0.2em]">
											Event Metadata
										</h4>
										<div className="grid grid-cols-2 gap-4">
											<div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
												<p className="mb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">
													Total Results
												</p>
												<p className="font-black text-4xl text-[#000031]">
													{filteredEvents.length}
												</p>
												<p className="mt-1 font-bold text-slate-400 text-xs">
													Events matching criteria
												</p>
											</div>
											<div className="rounded-[24px] border border-slate-100 bg-slate-50/50 p-6">
												<p className="mb-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">
													Quick Stats
												</p>
												<div className="flex items-center gap-2">
													<div className="h-2 w-2 rounded-full bg-emerald-500" />
													<p className="font-bold text-slate-600 text-xs">
														Active Directory
													</p>
												</div>
												<p className="mt-1 font-bold text-slate-400 text-xs">
													Real-time synchronization
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-10 flex items-center justify-between border-slate-50 border-t pt-6">
									<button
										type="button"
										onClick={() => {
											setQuery("");
											setModeFilter("ALL");
											setTypeFilter("ALL");
											setSortBy("SOONEST");
										}}
										className="font-black text-[10px] text-slate-400 uppercase tracking-widest transition-colors hover:text-red-500"
									>
										Reset All Parameters
									</button>
									<button
										type="button"
										onClick={() => setIsFilterOpen(false)}
										className="rounded-xl bg-blue-600 px-8 py-3 font-black text-[10px] text-white uppercase tracking-widest shadow-blue-200 shadow-lg transition-all hover:scale-105 active:scale-95"
									>
										Apply Filters
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Results Grid */}
			<section className="container relative z-10 mx-auto px-6 py-12">
				{eventsQuery.isLoading ? (
					<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="h-[450px] animate-pulse rounded-2xl bg-slate-50"
							/>
						))}
					</div>
				) : filteredEvents.length === 0 ? (
					<div className="py-40 text-center">
						<div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50">
							<Hash size={32} className="text-slate-300" />
						</div>
						<h2 className="font-black text-4xl text-[#000031]">
							No results found.
						</h2>
						<p className="mx-auto mt-4 max-w-md font-bold text-lg text-slate-400">
							Refine your search query or adjust filters to broaden your
							discovery.
						</p>
						<button
							type="button"
							onClick={() => {
								setQuery("");
								setModeFilter("ALL");
								setTypeFilter("ALL");
							}}
							className="mt-10 rounded-2xl bg-[#000031] px-10 py-5 font-black text-white text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-105"
						>
							Clear all search data
						</button>
					</div>
				) : (
					<div className="fade-in grid animate-in grid-cols-1 gap-x-8 gap-y-12 duration-1000 md:grid-cols-2 lg:grid-cols-3">
						{filteredEvents.map((event) => (
							<EventCard key={event.id} event={event} />
						))}
					</div>
				)}
			</section>

			{/* Footer Call to Action - Professional */}
			<section className="container mx-auto px-6 py-24">
				<div className="group relative overflow-hidden rounded-3xl bg-[#000031] p-12 md:p-20">
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.05]"
						style={{
							backgroundImage:
								"linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
							backgroundSize: "40px 40px",
						}}
					/>
					<div className="relative z-10 max-w-2xl">
						<h2 className="mb-8 font-black text-4xl text-white leading-tight md:text-5xl">
							Hosting something <br />
							extraordinary?
						</h2>
						<Link
							href="/dashboard/events/create"
							className="group inline-flex items-center gap-4 rounded-2xl bg-white px-10 py-5 font-black text-[#000031] text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
						>
							Create your event
							<ChevronRight
								size={16}
								className="transition-transform group-hover:translate-x-1"
							/>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
