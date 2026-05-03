"use client";

import type { EventRecord, TicketRecord } from "@unievent/schema";
import {
	Download,
	Loader2,
	MapPin,
	QrCode,
	Search,
	Ticket as TicketIcon,
} from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { ProtectedRoute } from "@/core/components/protected-route";
import { cn } from "@/core/lib/cn";
import { useEvents } from "@/modules/events";
import { usePasses } from "@/modules/passes";
import type { PassRecord } from "@/modules/passes/services/passes.service";
import { ticketsService, useTickets } from "@/modules/tickets";
import { MobileTicketPreview } from "@/modules/tickets/components/mobile-ticket-preview";
import { Button } from "@/shared/ui/button";

type Tab = "tickets" | "passes";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function TicketsPageContent() {
	const [activeTab, setActiveTab] = useState<Tab>("tickets");
	const eventsQuery = useEvents({ limit: 50 });
	const ticketsQuery = useTickets({ limit: 50 });
	const passesQuery = usePasses({ limit: 50 });
	const [eventFilter, setEventFilter] = useState("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTicketId, setSelectedTicketId] = useState("");

	const tickets = ticketsQuery.data?.data ?? [];
	const events = eventsQuery.data?.data ?? [];

	const selectedTicket = useMemo(
		() => tickets.find((t) => t.id === selectedTicketId) || null,
		[tickets, selectedTicketId],
	);

	if (
		ticketsQuery.isLoading ||
		eventsQuery.isLoading ||
		passesQuery.isLoading
	) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-[#071a78]" />
			</div>
		);
	}

	const handleDownloadPDF = async () => {
		if (!selectedTicket?.orderId) return;
		const { toast } = await import("sonner");
		try {
			const blob = await ticketsService.downloadTicket(selectedTicket.orderId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `ticket-${selectedTicket.id.slice(0, 8)}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			toast.success("Ticket downloaded successfully");
		} catch {
			toast.error("Failed to download ticket");
		}
	};

	const passes = passesQuery.data?.data ?? [];

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			{/* Header */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="font-bold text-2xl text-[#071a78]">
							My Tickets & Passes
						</h1>
						<p className="mt-1 text-slate-600">
							View and manage all your event tickets and entry passes.
						</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="mt-6 flex border-[#dbe7ff] border-b">
					<button
						type="button"
						onClick={() => setActiveTab("tickets")}
						className={cn(
							"px-4 py-3 font-medium text-sm transition-colors",
							activeTab === "tickets"
								? "border-[#071a78] border-b-2 text-[#071a78]"
								: "text-slate-500 hover:text-slate-700",
						)}
					>
						<TicketIcon className="mr-2 inline h-4 w-4" />
						Tickets ({tickets.length})
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("passes")}
						className={cn(
							"px-4 py-3 font-medium text-sm transition-colors",
							activeTab === "passes"
								? "border-[#071a78] border-b-2 text-[#071a78]"
								: "text-slate-500 hover:text-slate-700",
						)}
					>
						<QrCode className="mr-2 inline h-4 w-4" />
						Passes ({passes.length})
					</button>
				</div>
			</div>

			{activeTab === "tickets" ? (
				<TicketsTab
					tickets={tickets}
					events={events}
					eventFilter={eventFilter}
					setEventFilter={setEventFilter}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					selectedTicketId={selectedTicketId}
					setSelectedTicketId={setSelectedTicketId}
					onDownloadPDF={handleDownloadPDF}
				/>
			) : (
				<PassesTab passes={passes} />
			)}
		</div>
	);
}

interface TicketsTabProps {
	tickets: TicketRecord[];
	events: EventRecord[];
	eventFilter: string;
	setEventFilter: (value: string) => void;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	selectedTicketId: string;
	setSelectedTicketId: (value: string) => void;
	onDownloadPDF: () => void;
}

function TicketsTab({
	tickets,
	events,
	eventFilter,
	setEventFilter,
	searchQuery,
	setSearchQuery,
	selectedTicketId,
	setSelectedTicketId,
	onDownloadPDF,
}: TicketsTabProps) {
	const eventMap = useMemo(() => {
		const map = new Map();
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
		<div className="grid gap-6 lg:grid-cols-3">
			<div className="space-y-3 lg:col-span-2">
				<div className="flex flex-col gap-3 sm:flex-row">
					<div className="relative flex-1">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="Search tickets..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-10 w-full rounded-lg border border-[#dbe7ff] bg-white pr-4 pl-9 text-sm outline-none focus:border-[#071a78]"
						/>
					</div>
					<select
						value={eventFilter}
						onChange={(e) => setEventFilter(e.target.value)}
						className="h-10 rounded-lg border border-[#dbe7ff] bg-white px-3 text-sm outline-none focus:border-[#071a78]"
					>
						<option value="ALL">All Events</option>
						{events.map((e) => (
							<option key={e.id} value={e.id}>
								{e.name}
							</option>
						))}
					</select>
				</div>

				{filteredTickets.length === 0 ? (
					<div className="rounded-2xl border border-[#dbe7ff] border-dashed bg-white py-16 text-center">
						<TicketIcon className="mx-auto mb-4 h-12 w-12 text-slate-200" />
						<p className="text-slate-500">No tickets found</p>
					</div>
				) : (
					filteredTickets.map((ticket) => {
						const event = eventMap.get(ticket.eventId);
						const isSelected = selectedTicketId === ticket.id;
						return (
							<button
								type="button"
								key={ticket.id}
								onClick={() => setSelectedTicketId(ticket.id)}
								className={cn(
									"w-full rounded-xl border p-4 text-left transition-all",
									isSelected
										? "border-[#071a78] bg-[#071a78]/5 shadow-sm"
										: "border-[#dbe7ff] bg-white hover:border-[#071a78]/30",
								)}
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
										{event?.thumbnail ? (
											<Image
												src={event.thumbnail}
												alt=""
												width={48}
												height={48}
												className="h-full w-full object-cover"
											/>
										) : (
											<TicketIcon className="h-5 w-5 text-slate-300" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="truncate font-semibold text-slate-900">
											{event?.name || "Unknown Event"}
										</h3>
										<div className="mt-1 flex items-center gap-1 text-slate-500 text-xs">
											<MapPin className="h-3 w-3" />
											<span className="truncate">
												{event?.venueName || "Venue TBA"}
											</span>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-slate-900">
											₹{ticket.pricePaid.toLocaleString("en-IN")}
										</p>
										<p className="text-slate-400 text-xs">
											{ticket.orderId.slice(-4).toUpperCase()}
										</p>
									</div>
								</div>
							</button>
						);
					})
				)}
			</div>

			<div className="hidden lg:block">
				{selectedTicket ? (
					<div className="sticky top-20 space-y-4">
						<div className="rounded-2xl border border-[#dbe7ff] bg-white p-4 shadow-sm">
							<MobileTicketPreview
								ticket={selectedTicket}
								event={eventMap.get(selectedTicket.eventId)}
							/>
						</div>
						<Button
							onClick={onDownloadPDF}
							className="h-12 w-full gap-2 rounded-xl bg-[#071a78] font-semibold text-white hover:bg-[#0a24a0]"
						>
							<Download className="h-4 w-4" />
							Download PDF
						</Button>
					</div>
				) : (
					<div className="sticky top-20 rounded-2xl border border-[#dbe7ff] border-dashed bg-white p-10 text-center">
						<TicketIcon className="mx-auto mb-4 h-12 w-12 text-slate-200" />
						<p className="text-slate-500">Select a ticket to view details</p>
					</div>
				)}
			</div>
		</div>
	);
}

interface PassesTabProps {
	passes: PassRecord[];
}

function PassesTab({ passes }: PassesTabProps) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{passes.length === 0 ? (
				<div className="col-span-full rounded-2xl border border-[#dbe7ff] border-dashed bg-white py-16 text-center">
					<QrCode className="mx-auto mb-4 h-12 w-12 text-slate-200" />
					<p className="text-slate-500">No passes found</p>
				</div>
			) : (
				passes.map((pass) => (
					<div
						key={pass.id}
						className="rounded-2xl border border-[#dbe7ff] bg-white p-5 shadow-sm"
					>
						<div className="mb-4 flex items-center justify-between">
							<span
								className={cn(
									"rounded-full px-3 py-1 font-semibold text-xs",
									pass.status === "ACTIVE"
										? "bg-emerald-100 text-emerald-700"
										: pass.status === "USED"
											? "bg-slate-100 text-slate-700"
											: "bg-rose-100 text-rose-700",
								)}
							>
								{pass.status}
							</span>
							<span className="text-slate-500 text-xs">
								{formatDate(pass.createdAt)}
							</span>
						</div>

						<div className="mb-4 flex justify-center">
							<div className="rounded-lg border border-[#dbe7ff] bg-white p-4">
								<QRCodeSVG value={pass.code} size={120} level="M" />
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 text-sm">Pass Code</span>
								<span className="font-mono font-semibold text-sm">
									{pass.code}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-600 text-sm">Event ID</span>
								<span className="font-mono text-slate-500 text-xs">
									{pass.eventId.slice(0, 8)}...
								</span>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
}

export default function TicketsPage() {
	return (
		<ProtectedRoute>
			<TicketsPageContent />
		</ProtectedRoute>
	);
}
