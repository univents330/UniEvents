"use client";

import type { EventRecord } from "@unievent/schema";
import { format } from "date-fns";
import {
	Download,
	MapPin,
	Printer,
	Search,
	Ticket as TicketIcon,
	X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useEvents } from "@/modules/events";
import { Button } from "@/shared/ui/button";
import { MobileTicketPreview } from "../components/mobile-ticket-preview";
import { useTickets } from "../hooks/use-tickets";

export function TicketsView() {
	const eventsQuery = useEvents({ limit: 100 });
	const ticketsQuery = useTickets({ limit: 100 });
	const [eventFilter, setEventFilter] = useState("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTicketId, setSelectedTicketId] = useState("");
	const [showMobileSidebar, setShowMobileSidebar] = useState(false);

	const tickets = ticketsQuery.data?.data ?? [];
	const events = eventsQuery.data?.data ?? [];

	const eventMap = useMemo(() => {
		const map = new Map<string, EventRecord>();
		for (const event of events) {
			map.set(event.id, event);
		}
		return map;
	}, [events]);

	const filteredTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			const matchesEvent =
				eventFilter === "ALL" || ticket.eventId === eventFilter;
			const eventName = eventMap.get(ticket.eventId)?.name.toLowerCase() || "";
			const matchesSearch =
				searchQuery === "" ||
				ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				eventName.includes(searchQuery.toLowerCase());
			return matchesEvent && matchesSearch;
		});
	}, [tickets, eventFilter, searchQuery, eventMap]);

	const selectedTicket = useMemo(
		() => tickets.find((t) => t.id === selectedTicketId) || null,
		[tickets, selectedTicketId],
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-4 md:p-6">
				<div className="flex flex-col gap-4">
					<div>
						<h1 className="font-bold text-2xl text-slate-900 md:text-3xl">
							My Tickets
						</h1>
						<p className="mt-1 text-slate-600 text-sm">
							View and manage your event tickets
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<div className="relative flex-1 sm:max-w-xs">
							<Search
								className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
								size={16}
							/>
							<input
								type="text"
								placeholder="Search tickets..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#030370]"
							/>
						</div>

						<select
							value={eventFilter}
							onChange={(e) => setEventFilter(e.target.value)}
							className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#030370]"
						>
							<option value="ALL">All Events</option>
							{events.map((e) => (
								<option key={e.id} value={e.id}>
									{e.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-col gap-6 lg:flex-row">
				{/* Tickets List */}
				<div className="flex-1">
					{ticketsQuery.isLoading || eventsQuery.isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
								/>
							))}
						</div>
					) : filteredTickets.length === 0 ? (
						<div className="rounded-xl border border-slate-200 border-dashed bg-white p-8 text-center">
							<TicketIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
							<p className="font-medium text-slate-600">No tickets found</p>
							<p className="mt-1 text-slate-400 text-sm">
								Try adjusting your filters
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredTickets.map((ticket) => {
								const event = eventMap.get(ticket.eventId);
								const isSelected = selectedTicketId === ticket.id;
								return (
									<button
										type="button"
										key={ticket.id}
										onClick={() => {
											setSelectedTicketId(ticket.id);
											setShowMobileSidebar(true);
										}}
										className={`cursor-pointer rounded-xl border p-4 text-left transition ${
											isSelected
												? "border-[#030370] bg-[#030370]/5"
												: "border-slate-200 bg-white hover:border-[#030370]"
										}`}
									>
										<div className="flex items-start justify-between gap-4">
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-3">
													<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
														{event?.thumbnail ? (
															<Image
																src={event.thumbnail}
																alt=""
																width={48}
																height={48}
																className="h-full w-full rounded-lg object-cover"
															/>
														) : (
															<TicketIcon
																className="text-slate-400"
																size={20}
															/>
														)}
													</div>
													<div className="min-w-0">
														<h3 className="truncate font-semibold text-slate-900">
															{event?.name || "Unknown Event"}
														</h3>
														<div className="mt-1 flex items-center gap-1 text-slate-500 text-sm">
															<MapPin size={14} />
															<span className="truncate">
																{event?.venueName || "TBA"}
															</span>
														</div>
													</div>
												</div>
											</div>
											<div className="shrink-0 text-right">
												<p className="font-bold text-slate-900">
													₹{ticket.pricePaid.toLocaleString("en-IN")}
												</p>
												<p className="mt-1 text-slate-500 text-xs">
													{format(new Date(ticket.createdAt), "MMM dd, yyyy")}
												</p>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Sidebar - Desktop */}
				<div className="hidden w-96 shrink-0 lg:block">
					{selectedTicket ? (
						<div className="sticky top-24 space-y-4">
							<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-lg">
								<MobileTicketPreview
									ticket={selectedTicket}
									event={eventMap.get(selectedTicket.eventId)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<Button className="gap-2 bg-[#030370] text-white hover:bg-slate-900">
									<Printer size={16} />
									Print
								</Button>
								<Button
									variant="ghost"
									className="gap-2 border-[#dbe7ff] hover:bg-slate-50"
								>
									<Download size={16} />
									Save PDF
								</Button>
							</div>

							<div className="rounded-xl border border-[#dbe7ff] bg-white p-4 text-center">
								<p className="text-slate-400 text-xs uppercase tracking-wider">
									Ref: {selectedTicket.id}
								</p>
							</div>
						</div>
					) : (
						<div className="sticky top-24 rounded-2xl border border-[#dbe7ff] border-dashed bg-white p-8 text-center">
							<TicketIcon className="mx-auto mb-4 h-12 w-12 text-slate-200" />
							<p className="font-medium text-slate-400">Select a ticket</p>
							<p className="mt-1 text-slate-300 text-sm">to view details</p>
						</div>
					)}
				</div>
			</div>

			{/* Mobile Modal */}
			{showMobileSidebar && selectedTicket && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black/50"
						onClick={() => setShowMobileSidebar(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setShowMobileSidebar(false);
						}}
						aria-label="Close ticket details"
					/>
					<div className="slide-in-from-bottom absolute right-0 bottom-0 left-0 max-h-[90vh] animate-in overflow-y-auto rounded-t-3xl bg-white p-6 duration-300">
						<div className="mb-6 flex items-center justify-between">
							<h3 className="font-bold text-lg text-slate-900">
								Ticket Details
							</h3>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowMobileSidebar(false)}
							>
								<X size={24} />
							</Button>
						</div>
						<MobileTicketPreview
							ticket={selectedTicket}
							event={eventMap.get(selectedTicket.eventId)}
						/>
						<div className="mt-6 grid grid-cols-2 gap-3">
							<Button className="gap-2 bg-[#030370] text-white hover:bg-slate-900">
								<Printer size={16} />
								Print
							</Button>
							<Button
								variant="ghost"
								className="gap-2 border-[#dbe7ff] hover:bg-slate-50"
							>
								<Download size={16} />
								Save PDF
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
