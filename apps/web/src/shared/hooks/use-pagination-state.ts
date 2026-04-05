"use client";

import { useMemo, useState } from "react";

export type PaginationState = {
	page: number;
	limit: number;
};

export function usePaginationState(initial?: Partial<PaginationState>) {
	const [page, setPage] = useState(initial?.page ?? 1);
	const [limit, setLimit] = useState(initial?.limit ?? 20);

	const pagination = useMemo(() => ({ page, limit }), [page, limit]);

	return {
		pagination,
		setPage,
		setLimit,
	};
}
