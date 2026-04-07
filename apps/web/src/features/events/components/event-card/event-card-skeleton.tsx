import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
			<Skeleton className="h-44 w-full rounded-xl bg-slate-200/80" />
			<div className="mt-5 space-y-3">
				<Skeleton className="h-4 w-1/3 rounded bg-slate-200/80" />
				<Skeleton className="h-4 w-full rounded bg-slate-200/80" />
				<Skeleton className="h-4 w-full rounded bg-slate-200/80" />
				<Skeleton className="h-4 w-3/4 rounded bg-slate-200/80" />
				<Skeleton className="mt-2 h-4 w-4/5 rounded bg-slate-200/80" />
			</div>
		</div>
	);
}
