"use client";

import { useEffect, useMemo, useState } from "react";
import {
	clearEventApprovalRequests,
	deleteEventApprovalRequest,
	type EventApprovalRequest,
	getEventApprovalRequests,
	type ReviewEventApprovalRequestInput,
	reviewEventApprovalRequest,
	type SubmitEventApprovalRequestInput,
	submitEventApprovalRequest,
	subscribeEventApprovalRequests,
} from "@/shared/lib/event-approval-requests";

export function useEventApprovalRequests() {
	const [requests, setRequests] = useState<EventApprovalRequest[]>(() =>
		getEventApprovalRequests(),
	);

	useEffect(() => {
		const unsubscribe = subscribeEventApprovalRequests(setRequests);

		const handleStorage = (event: StorageEvent) => {
			if (event.key === "voltaze:event-approval-requests") {
				setRequests(getEventApprovalRequests());
			}
		};

		window.addEventListener("storage", handleStorage);

		return () => {
			unsubscribe();
			window.removeEventListener("storage", handleStorage);
		};
	}, []);

	const pendingRequests = useMemo(
		() => requests.filter((request) => request.status === "PENDING"),
		[requests],
	);

	return {
		requests,
		pendingRequests,
		submitEventApprovalRequest,
		reviewEventApprovalRequest,
		deleteEventApprovalRequest,
		clearEventApprovalRequests,
	};
}
