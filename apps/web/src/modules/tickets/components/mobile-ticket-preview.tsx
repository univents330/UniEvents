"use client";

import type { EventRecord, TicketRecord } from "@unievent/schema";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Ticket as TicketIcon } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

interface MobileTicketPreviewProps {
	ticket: TicketRecord;
	event?: EventRecord;
}

export function MobileTicketPreview({
	ticket,
	event,
}: MobileTicketPreviewProps) {
	const eventDate = event?.startDate ? new Date(event.startDate) : new Date();

	return (
		<div className="flex w-full flex-col bg-white">
			{/* Sharp Header / Event Image */}
			<div className="relative h-44 w-full overflow-hidden border-[#030370] border-b-4 bg-slate-900">
				{event?.thumbnail ? (
					<Image
						src={event.thumbnail}
						alt={event.name}
						fill
						className="object-cover opacity-60"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-slate-800">
						<TicketIcon size={40} className="text-white/10" />
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
				<div className="absolute bottom-0 left-0 w-full p-5">
					<div className="mb-1.5 flex items-center gap-2">
						<span className="bg-[#030370] px-3 py-0.5 font-black text-[8px] text-white uppercase tracking-[0.2em]">
							{ticket.tierId.split("_").join(" ")}
						</span>
					</div>
					<h2 className="line-clamp-2 font-black text-lg text-white uppercase leading-tight tracking-tighter">
						{event?.name || "Ticket ID"}
					</h2>
				</div>
			</div>

			{/* Info Section - Sharp Grid */}
			<div className="space-y-8 border-[#dbe7ff] border-x bg-white p-6">
				<div className="grid grid-cols-2 divide-x divide-slate-100 border-slate-100 border-b pb-6">
					<div className="space-y-1 pr-4">
						<div className="flex items-center gap-1.5 text-slate-400">
							<Calendar size={10} />
							<span className="font-black text-[9px] uppercase tracking-[0.2em]">
								Asset Date
							</span>
						</div>
						<p className="font-black text-slate-900 text-xs uppercase tracking-tight">
							{format(eventDate, "dd MMM yyyy")}
						</p>
					</div>
					<div className="space-y-1 pl-6">
						<div className="flex items-center gap-1.5 text-slate-400">
							<Clock size={10} />
							<span className="font-black text-[9px] uppercase tracking-[0.2em]">
								Entry Time
							</span>
						</div>
						<p className="font-black text-slate-900 text-xs uppercase tracking-tight">
							{format(eventDate, "hh:mm a")}
						</p>
					</div>
				</div>

				<div className="space-y-1">
					<div className="flex items-center gap-1.5 text-slate-400">
						<MapPin size={10} />
						<span className="font-black text-[9px] uppercase tracking-[0.2em]">
							Venue
						</span>
					</div>
					<p className="line-clamp-1 font-black text-slate-900 text-xs uppercase tracking-widest">
						{event?.venueName || "TBA"}
					</p>
				</div>

				{/* QR Code Section - Sharp Container */}
				<div className="flex flex-col items-center pt-2">
					<div className="group border border-slate-100 bg-slate-50 p-6 shadow-inner">
						<div className="border border-slate-100 bg-white p-4 shadow-lg">
							<QRCodeSVG
								value={ticket.id}
								size={160}
								level="H"
								includeMargin={false}
							/>
						</div>
					</div>
					<div className="mt-8 space-y-1 text-center">
						<p className="mb-2 font-black text-[8px] text-slate-400 uppercase tracking-[0.4em]">
							Verified Unique Identifier
						</p>
						<p className="border border-slate-100 bg-slate-50 px-4 py-2 font-black font-mono text-slate-900 text-sm uppercase tracking-widest">
							{ticket.id.slice(0, 12)}
						</p>
					</div>
				</div>
			</div>

			{/* Footer - Professional Sharp */}
			<div className="mt-auto bg-slate-900 p-5 text-center">
				<p className="font-black text-[8px] text-white uppercase leading-relaxed tracking-[0.3em] opacity-60">
					This pass is valid for one-time entry. Verified by UniEvents System
					Protocol.
				</p>
			</div>
		</div>
	);
}
