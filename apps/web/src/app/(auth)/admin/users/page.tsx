"use client";

import { useMemo } from "react";
import { useAttendees } from "@/features/attendees";
import { useEvents } from "@/features/events";
import { PageHeader } from "@/shared/ui/page-header";

export default function AdminUsersPage() {
	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});
	const attendeesQuery = useAttendees({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const allEvents = eventsQuery.data?.data ?? [];
	const allAttendees = attendeesQuery.data?.data ?? [];

	const hosts = useMemo(() => {
		const map = new Map<string, { hostId: string; events: number }>();
		for (const event of allEvents) {
			if (!event.userId) continue;
			const current = map.get(event.userId) ?? {
				hostId: event.userId,
				events: 0,
			};
			current.events += 1;
			map.set(event.userId, current);
		}
		return Array.from(map.values()).sort((a, b) => b.events - a.events);
	}, [allEvents]);

	const attendeeUsers = useMemo(() => {
		const map = new Map<string, { userId: string; attendees: number }>();
		for (const attendee of allAttendees) {
			if (!attendee.userId) continue;
			const current = map.get(attendee.userId) ?? {
				userId: attendee.userId,
				attendees: 0,
			};
			current.attendees += 1;
			map.set(attendee.userId, current);
		}
		return Array.from(map.values()).sort((a, b) => b.attendees - a.attendees);
	}, [allAttendees]);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Users"
				description="Global user visibility for super admin."
			/>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<StatCard label="Hosts" value={hosts.length} />
				<StatCard label="Events" value={allEvents.length} />
				<StatCard label="Attendee Users" value={attendeeUsers.length} />
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5">
					<h2 className="font-semibold text-[#071a78] text-lg">Hosts</h2>
					<p className="mt-1 text-slate-600 text-sm">
						All host IDs with event counts.
					</p>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-slate-200 border-b text-left text-slate-500 text-xs uppercase tracking-wide">
									<th className="py-2">Host ID</th>
									<th className="py-2 text-right">Events</th>
								</tr>
							</thead>
							<tbody>
								{hosts.length === 0 ? (
									<tr>
										<td className="py-3 text-slate-500 text-sm" colSpan={2}>
											No hosts found.
										</td>
									</tr>
								) : (
									hosts.map((host) => (
										<tr key={host.hostId} className="border-slate-100 border-b">
											<td className="py-2 font-mono text-slate-700 text-xs">
												{host.hostId}
											</td>
											<td className="py-2 text-right font-semibold text-slate-900">
												{host.events}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-5">
					<h2 className="font-semibold text-[#071a78] text-lg">
						Attendee-linked Users
					</h2>
					<p className="mt-1 text-slate-600 text-sm">
						User IDs found on attendee records.
					</p>
					<div className="mt-4 overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-slate-200 border-b text-left text-slate-500 text-xs uppercase tracking-wide">
									<th className="py-2">User ID</th>
									<th className="py-2 text-right">Attendees</th>
								</tr>
							</thead>
							<tbody>
								{attendeeUsers.length === 0 ? (
									<tr>
										<td className="py-3 text-slate-500 text-sm" colSpan={2}>
											No linked users found.
										</td>
									</tr>
								) : (
									attendeeUsers.map((user) => (
										<tr key={user.userId} className="border-slate-100 border-b">
											<td className="py-2 font-mono text-slate-700 text-xs">
												{user.userId}
											</td>
											<td className="py-2 text-right font-semibold text-slate-900">
												{user.attendees}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-4">
			<p className="text-slate-600 text-sm">{label}</p>
			<p className="mt-1 font-bold text-2xl text-slate-900">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}
