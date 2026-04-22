"use client";

import {
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	QrCode,
	Search,
	Trash2,
	UserCheck,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { useAttendees } from "@/modules/attendees";
import { useEvents } from "@/modules/events";
import { useValidatePass } from "@/modules/passes";
import {
	useCheckIns,
	useCreateCheckIn,
	useDeleteCheckIn,
} from "../hooks/use-check-ins";

// Skeleton loading component for table rows
function TableRowSkeleton() {
	return (
		<tr>
			<td className="px-4 py-3">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
			</td>
			<td className="px-4 py-3">
				<div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
			</td>
		</tr>
	);
}

const PAGE_SIZE = 50;

export function CheckInsView() {
	const { user } = useAuth();
	const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
	const [method, setMethod] = useState<"ALL" | "QR_SCAN" | "MANUAL">("ALL");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	// Modal state
	const [showManual, setShowManual] = useState(false);
	const [showScanner, setShowScanner] = useState(false);

	// Manual check-in form
	const [manualEventId, setManualEventId] = useState("");
	const [manualAttendeeId, setManualAttendeeId] = useState("");

	// QR scanner
	const [qrEventId, setQrEventId] = useState("");
	const [qrCode, setQrCode] = useState("");

	const eventsQuery = useEvents({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
	});
	const hostEvents = eventsQuery.data?.data ?? [];
	const eventNameById = useMemo(
		() => new Map(hostEvents.map((e) => [e.id, e.name])),
		[hostEvents],
	);

	// Fetch attendees for the selected event in manual modal
	const attendeesQuery = useAttendees(
		manualEventId
			? {
					eventId: manualEventId,
					page: 1,
					limit: 100,
					sortBy: "name",
					sortOrder: "asc",
				}
			: undefined,
	);
	const eventAttendees = attendeesQuery.data?.data ?? [];

	const checkInsQuery = useCheckIns({
		page,
		limit: PAGE_SIZE,
		sortBy: "timestamp",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
		...(method !== "ALL" ? { method } : {}),
	});

	const visibleCheckIns = checkInsQuery.data?.data ?? [];
	const meta = checkInsQuery.data?.meta;

	// Fetch attendees for name resolution (current page only)
	const allAttendeesQuery = useAttendees({
		page: 1,
		limit: 100,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(selectedEventId !== "ALL" ? { eventId: selectedEventId } : {}),
	});
	const attendeeNameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const a of allAttendeesQuery.data?.data ?? []) {
			map.set(a.id, a.name);
		}
		return map;
	}, [allAttendeesQuery.data?.data]);

	const stats = useMemo(() => {
		const total = meta?.total ?? 0;
		const qr = visibleCheckIns.filter((c) => c.method === "QR_SCAN").length;
		const manual = visibleCheckIns.filter((c) => c.method === "MANUAL").length;
		const events = new Set(visibleCheckIns.map((c) => c.eventId)).size;
		return { total, qr, manual, events };
	}, [visibleCheckIns, meta?.total]);

	const createCheckIn = useCreateCheckIn();
	const deleteCheckIn = useDeleteCheckIn();
	const validatePass = useValidatePass();

	// Duplicate detection
	const { duplicateKeys, hasDuplicates } = useMemo(() => {
		const counts = new Map<string, number>();
		const dupKeys = new Set<string>();
		for (const row of visibleCheckIns) {
			const key = `${row.attendeeId}::${row.eventId}`;
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		for (const row of visibleCheckIns) {
			const key = `${row.attendeeId}::${row.eventId}`;
			if ((counts.get(key) ?? 0) > 1) {
				dupKeys.add(key);
			}
		}
		return { duplicateKeys: dupKeys, hasDuplicates: dupKeys.size > 0 };
	}, [visibleCheckIns]);

	function handleFilterChange(newEventId: string) {
		setSelectedEventId(newEventId);
		setPage(1);
	}

	function handleMethodChange(newMethod: typeof method) {
		setMethod(newMethod);
		setPage(1);
	}

	function handleSearchChange(value: string) {
		setSearch(value);
		setPage(1);
	}

	async function handleManualCheckIn() {
		if (!manualEventId || !manualAttendeeId) return;
		await createCheckIn.mutateAsync({
			attendeeId: manualAttendeeId,
			eventId: manualEventId,
			method: "MANUAL",
		});
		setShowManual(false);
		setManualEventId("");
		setManualAttendeeId("");
	}

	async function handleQrCheckIn() {
		if (!qrEventId || !qrCode.trim()) return;
		// Validate the pass code first, then create check-in
		const result = await validatePass.mutateAsync({
			code: qrCode.trim(),
			eventId: qrEventId,
		});
		if (!result.valid || !result.pass) {
			return;
		}
		await createCheckIn.mutateAsync({
			attendeeId: result.pass.attendeeId,
			eventId: qrEventId,
			method: "QR_SCAN",
		});
		setShowScanner(false);
		setQrCode("");
		setQrEventId("");
	}

	// Filter visible check-ins by search (client-side on current page)
	const filteredCheckIns = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return visibleCheckIns;
		return visibleCheckIns.filter((c) => {
			const name = attendeeNameById.get(c.attendeeId) ?? "";
			const eventName = eventNameById.get(c.eventId) ?? "";
			return (
				name.toLowerCase().includes(q) ||
				eventName.toLowerCase().includes(q) ||
				c.method.toLowerCase().includes(q)
			);
		});
	}, [visibleCheckIns, search, attendeeNameById, eventNameById]);

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="font-bold text-3xl text-slate-900">Check-ins</h1>
					<p className="mt-2 text-slate-600">
						Manage and track event check-ins.
					</p>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => {
							setShowScanner(true);
							setQrEventId("");
							setQrCode("");
						}}
						className="flex items-center gap-2 rounded-lg border border-[#030370] px-4 py-2 font-semibold text-[#030370] text-sm transition hover:bg-[#f0f4ff]"
					>
						<QrCode className="h-4 w-4" />
						QR Scan
					</button>
					<button
						type="button"
						onClick={() => {
							setShowManual(true);
							setManualEventId("");
							setManualAttendeeId("");
						}}
						className="flex items-center gap-2 rounded-lg bg-[#030370] px-4 py-2 font-semibold text-sm text-white transition hover:bg-[#0a4bb8]"
					>
						<UserCheck className="h-4 w-4" />
						Manual Check-in
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
					<input
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						type="text"
						placeholder="Search by name or event..."
						className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
					/>
				</div>
				<select
					value={selectedEventId}
					onChange={(e) => handleFilterChange(e.target.value)}
					className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All my events</option>
					{hostEvents.map((event) => (
						<option key={event.id} value={event.id}>
							{event.name}
						</option>
					))}
				</select>
				<select
					value={method}
					onChange={(e) => handleMethodChange(e.target.value as typeof method)}
					className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
				>
					<option value="ALL">All methods</option>
					<option value="QR_SCAN">QR Scan</option>
					<option value="MANUAL">Manual</option>
				</select>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<StatCard label="Total" value={stats.total} />
				<StatCard label="QR scan" value={stats.qr} />
				<StatCard label="Manual" value={stats.manual} />
				<StatCard label="Events" value={stats.events} />
			</div>

			{hasDuplicates && (
				<div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-bold text-amber-800 text-xs">
					<AlertTriangle size={16} />
					<span>
						{duplicateKeys.size} attendee(s) have duplicate scans on this page.
					</span>
				</div>
			)}

			<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-slate-200 border-b bg-slate-50">
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Attendee
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Event
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Method
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm">
									Timestamp
								</th>
								<th className="px-4 py-3 text-left font-semibold text-slate-900 text-sm" />
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{checkInsQuery.isLoading ? (
								<>
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
									<TableRowSkeleton />
								</>
							) : filteredCheckIns.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-600" colSpan={5}>
										No check-ins found.
									</td>
								</tr>
							) : (
								filteredCheckIns.map((checkIn) => (
									<tr key={checkIn.id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-slate-900">
											{attendeeNameById.get(checkIn.attendeeId) ??
												checkIn.attendeeId}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{eventNameById.get(checkIn.eventId) ?? checkIn.eventId}
										</td>
										<td className="px-4 py-3">
											<span
												className={`rounded-full px-2 py-1 font-semibold text-xs ${
													checkIn.method === "QR_SCAN"
														? "border border-[#dbe7ff] bg-[#f3f8ff] text-[#0a4bb8]"
														: "border border-slate-200 bg-slate-50 text-slate-600"
												}`}
											>
												{checkIn.method === "QR_SCAN" ? "QR Scan" : "Manual"}
											</span>
										</td>
										<td className="px-4 py-3 text-slate-600">
											{new Date(checkIn.timestamp).toLocaleString("en-IN")}
										</td>
										<td className="px-4 py-3">
											<button
												type="button"
												onClick={() => deleteCheckIn.mutate(checkIn.id)}
												disabled={deleteCheckIn.isPending}
												className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
												title="Delete check-in"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{meta && meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-slate-200 border-t px-4 py-3">
						<p className="text-slate-600 text-sm">
							Showing{" "}
							<span className="font-medium">
								{(page - 1) * PAGE_SIZE + 1}–
								{Math.min(page * PAGE_SIZE, meta.total)}
							</span>{" "}
							of <span className="font-medium">{meta.total}</span> check-ins
						</p>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setPage((p) => p - 1)}
								disabled={!meta.hasPreviousPage}
								className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							{Array.from({ length: meta.totalPages }, (_, i) => i + 1)
								.filter(
									(p) =>
										p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1,
								)
								.reduce<(number | "...")[]>((acc, p, idx, arr) => {
									if (idx > 0 && p - (arr[idx - 1] as number) > 1)
										acc.push("...");
									acc.push(p);
									return acc;
								}, [])
								.map((p, idx) =>
									p === "..." ? (
										<span
											key={`ellipsis-${idx}`}
											className="px-1 text-slate-400 text-sm"
										>
											…
										</span>
									) : (
										<button
											key={p}
											type="button"
											onClick={() => setPage(p as number)}
											className={`min-w-[32px] rounded-lg px-2 py-1 font-medium text-sm transition ${
												p === page
													? "bg-[#030370] text-white"
													: "text-slate-700 hover:bg-slate-100"
											}`}
										>
											{p}
										</button>
									),
								)}
							<button
								type="button"
								onClick={() => setPage((p) => p + 1)}
								disabled={!meta.hasNextPage}
								className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Manual Check-in Modal */}
			{showManual && (
				<Modal title="Manual Check-in" onClose={() => setShowManual(false)}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="manual-event"
								className="mb-1 block font-medium text-slate-700 text-sm"
							>
								Event
							</label>
							<select
								id="manual-event"
								value={manualEventId}
								onChange={(e) => {
									setManualEventId(e.target.value);
									setManualAttendeeId("");
								}}
								className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							>
								<option value="">Select event...</option>
								{hostEvents.map((e) => (
									<option key={e.id} value={e.id}>
										{e.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								htmlFor="manual-attendee"
								className="mb-1 block font-medium text-slate-700 text-sm"
							>
								Attendee
							</label>
							<select
								id="manual-attendee"
								value={manualAttendeeId}
								onChange={(e) => setManualAttendeeId(e.target.value)}
								disabled={!manualEventId || attendeesQuery.isLoading}
								className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8] disabled:opacity-50"
							>
								<option value="">
									{!manualEventId
										? "Select an event first"
										: attendeesQuery.isLoading
											? "Loading..."
											: "Select attendee..."}
								</option>
								{eventAttendees.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name} — {a.email}
									</option>
								))}
							</select>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onClick={() => setShowManual(false)}
								className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleManualCheckIn}
								disabled={
									!manualEventId || !manualAttendeeId || createCheckIn.isPending
								}
								className="rounded-lg bg-[#030370] px-4 py-2 font-semibold text-sm text-white hover:bg-[#0a4bb8] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{createCheckIn.isPending ? "Checking in..." : "Check In"}
							</button>
						</div>
					</div>
				</Modal>
			)}

			{/* QR Scan Modal */}
			{showScanner && (
				<Modal title="QR Code Check-in" onClose={() => setShowScanner(false)}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="qr-event"
								className="mb-1 block font-medium text-slate-700 text-sm"
							>
								Event
							</label>
							<select
								id="qr-event"
								value={qrEventId}
								onChange={(e) => setQrEventId(e.target.value)}
								className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							>
								<option value="">Select event...</option>
								{hostEvents.map((e) => (
									<option key={e.id} value={e.id}>
										{e.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								htmlFor="qr-code"
								className="mb-1 block font-medium text-slate-700 text-sm"
							>
								Pass Code
							</label>
							<input
								id="qr-code"
								type="text"
								value={qrCode}
								onChange={(e) => setQrCode(e.target.value)}
								placeholder="Paste or type pass code..."
								className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a4bb8]"
							/>
							<p className="mt-1 text-slate-500 text-xs">
								Enter the pass code from the attendee's QR ticket.
							</p>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<button
								type="button"
								onClick={() => setShowScanner(false)}
								className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleQrCheckIn}
								disabled={
									!qrEventId ||
									!qrCode.trim() ||
									validatePass.isPending ||
									createCheckIn.isPending
								}
								className="rounded-lg bg-[#030370] px-4 py-2 font-semibold text-sm text-white hover:bg-[#0a4bb8] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{validatePass.isPending || createCheckIn.isPending
									? "Processing..."
									: "Check In"}
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-[#dbe7ff] bg-white p-4">
			<p className="text-slate-600 text-sm">{label}</p>
			<p className="mt-1 font-bold text-2xl text-slate-900">
				{value.toLocaleString("en-IN")}
			</p>
		</div>
	);
}

function Modal({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-slate-200 border-b px-6 py-4">
					<h2 className="font-semibold text-slate-900">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="px-6 py-5">{children}</div>
			</div>
		</div>
	);
}
