"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { PaginationMeta } from "@unievent/schema";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { cn } from "@/core/lib/cn";
import { Button } from "./button";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	meta?: PaginationMeta;
	onPageChange?: (page: number) => void;
	onRowClick?: (row: TData) => void;
	isLoading?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	meta,
	onPageChange,
	onRowClick,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		pageCount: meta?.totalPages ?? -1,
	});

	return (
		<div className="fade-in animate-in space-y-4 duration-500">
			<div className="overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white shadow-sm transition-all hover:shadow-md">
				<table className="w-full text-left text-sm">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr
								key={headerGroup.id}
								className="border-[#dbe7ff] border-b bg-slate-50/50"
							>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-6 py-4 font-bold text-[#071a78] text-[11px] uppercase tracking-[0.1em]"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-slate-100">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<tr key={i} className="animate-pulse">
									{columns.map((_, j) => (
										<td key={j} className="px-6 py-4">
											<div className="h-4 w-full rounded bg-slate-100" />
										</td>
									))}
								</tr>
							))
						) : data.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-12 text-center font-medium text-slate-500"
								>
									<div className="flex flex-col items-center gap-2">
										<p>No records found</p>
										<p className="text-slate-400 text-xs">
											Try adjusting your filters
										</p>
									</div>
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									onClick={() => onRowClick?.(row.original)}
									className={cn(
										"bg-white transition-all hover:bg-blue-50/30",
										onRowClick ? "cursor-pointer" : "",
									)}
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className="whitespace-nowrap px-6 py-4 font-medium text-slate-700"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{meta && meta.totalPages > 1 && (
				<div className="flex items-center justify-between px-2">
					<div className="flex-1 font-bold text-slate-500 text-xs uppercase tracking-wider">
						Page {meta.page} of {meta.totalPages} · {meta.total} records
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-xl border-[#dbe7ff] p-0 hover:bg-blue-50 hover:text-[#030370]"
							onClick={() => onPageChange?.(1)}
							disabled={!meta.hasPreviousPage}
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-xl border-[#dbe7ff] p-0 hover:bg-blue-50 hover:text-[#030370]"
							onClick={() => onPageChange?.(meta.page - 1)}
							disabled={!meta.hasPreviousPage}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-xl border-[#dbe7ff] p-0 hover:bg-blue-50 hover:text-[#030370]"
							onClick={() => onPageChange?.(meta.page + 1)}
							disabled={!meta.hasNextPage}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							className="h-9 w-9 rounded-xl border-[#dbe7ff] p-0 hover:bg-blue-50 hover:text-[#030370]"
							onClick={() => onPageChange?.(meta.totalPages)}
							disabled={!meta.hasNextPage}
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
