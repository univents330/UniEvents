"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { usePasses } from "../hooks/use-passes";
import type { PassRecord } from "../services/passes.service";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

const statusVariant: Record<
	string,
	"default" | "success" | "warning" | "destructive"
> = {
	ACTIVE: "success",
	USED: "default",
	CANCELLED: "destructive",
};

const typeVariant: Record<
	string,
	"default" | "success" | "warning" | "destructive"
> = {
	GENERAL: "default",
	VIP: "warning",
	BACKSTAGE: "destructive",
	SPEAKER: "success",
};

import { QRCodeSVG } from "qrcode.react";

export function PassesView() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("");
	const [type, setType] = useState<string>("");

	const passesQuery = usePasses({
		page,
		limit: 20,
		status: (status || undefined) as
			| "ACTIVE"
			| "USED"
			| "CANCELLED"
			| undefined,
		type: (type || undefined) as
			| "GENERAL"
			| "VIP"
			| "BACKSTAGE"
			| "SPEAKER"
			| undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const columns: ColumnDef<PassRecord>[] = [
		{
			accessorKey: "code",
			header: "Entry QR Code",
			cell: ({ row }) => (
				<div className="flex items-center gap-4">
					<div className="rounded-md border bg-white p-1">
						<QRCodeSVG value={row.original.code} size={48} level="M" />
					</div>
					<span className="font-mono font-semibold text-sm">
						{row.original.code}
					</span>
				</div>
			),
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant={typeVariant[row.original.type] ?? "default"}>
					{row.original.type}
				</Badge>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={statusVariant[row.original.status] ?? "default"}>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: "eventId",
			header: "Event",
			cell: ({ row }) => (
				<Badge variant="outline">{row.original.eventId.slice(0, 8)}...</Badge>
			),
		},
		{
			accessorKey: "attendeeId",
			header: "Attendee",
			cell: ({ row }) => (
				<span className="text-[#5f6984]">
					{row.original.attendeeId.slice(0, 10)}...
				</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Issued",
			cell: ({ row }) => (
				<span className="text-[#5f6984] text-sm">
					{formatDate(row.original.createdAt)}
				</span>
			),
		},
	];

	if (passesQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">Loading passes...</div>
		);
	}

	if (passesQuery.isError) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load passes right now.
			</div>
		);
	}

	return (
		<div className="space-y-6 md:space-y-8">
			<SectionTitle
				eyebrow="Passes"
				title="Entry passes for all events"
				description="View, filter, and manage entry passes. Each pass has a unique code for QR-based check-in."
			/>

			<section className="panel-soft grid gap-4 p-4 md:grid-cols-2 md:items-end md:p-5">
				<label htmlFor="status-filter" className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Status
					</span>
					<Select
						id="status-filter"
						value={status}
						onChange={(e) => {
							setStatus(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All statuses</option>
						<option value="ACTIVE">Active</option>
						<option value="USED">Used</option>
						<option value="CANCELLED">Cancelled</option>
					</Select>
				</label>

				<label htmlFor="type-filter" className="space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Type
					</span>
					<Select
						id="type-filter"
						value={type}
						onChange={(e) => {
							setType(e.target.value);
							setPage(1);
						}}
					>
						<option value="">All types</option>
						<option value="GENERAL">General</option>
						<option value="VIP">VIP</option>
						<option value="BACKSTAGE">Backstage</option>
						<option value="SPEAKER">Speaker</option>
					</Select>
				</label>
			</section>

			<DataTable
				columns={columns}
				data={passesQuery.data?.data ?? []}
				meta={passesQuery.data?.meta}
				onPageChange={setPage}
			/>
		</div>
	);
}
