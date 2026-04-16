import type { AppRole } from "@/shared/hooks";

export type EventApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SerializableEventDraft = {
	name: string;
	description: string;
	venueName: string;
	address: string;
	startDate: string;
	endDate: string;
	type: "FREE" | "PAID";
	mode: "ONLINE" | "OFFLINE";
	visibility: "PUBLIC" | "PRIVATE";
	coverUrl: string;
	thumbnail: string;
	timezone: string;
	ticketTierName: string;
	ticketTierPrice: string;
	ticketTierQuantity: string;
};

export type EventApprovalActor = {
	id: string;
	name: string | null;
	email: string | null;
	role: AppRole;
};

export type EventApprovalRequest = {
	id: string;
	status: EventApprovalStatus;
	createdAt: string;
	updatedAt: string;
	submittedBy: EventApprovalActor;
	reviewedBy?: EventApprovalActor | null;
	reviewNote?: string;
	eventId?: string;
	draft: SerializableEventDraft;
};

export type SubmitEventApprovalRequestInput = {
	draft: SerializableEventDraft;
	submittedBy: EventApprovalActor;
	eventId?: string;
};

export type ReviewEventApprovalRequestInput = {
	reviewedBy: EventApprovalActor;
	reviewNote?: string;
	eventId?: string;
};

type Listener = (requests: EventApprovalRequest[]) => void;

const STORAGE_KEY = "voltaze:event-approval-requests";
const MAX_ITEMS = 60;

let approvalRequestsCache: EventApprovalRequest[] | null = null;
const listeners = new Set<Listener>();

function isBrowser() {
	return typeof window !== "undefined";
}

function createId() {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isRequest(value: unknown): value is EventApprovalRequest {
	if (!value || typeof value !== "object") {
		return false;
	}

	const item = value as Record<string, unknown>;
	return (
		typeof item.id === "string" &&
		(item.status === "PENDING" ||
			item.status === "APPROVED" ||
			item.status === "REJECTED") &&
		typeof item.createdAt === "string" &&
		typeof item.updatedAt === "string" &&
		item.submittedBy !== null &&
		typeof item.submittedBy === "object" &&
		item.draft !== null &&
		typeof item.draft === "object"
	);
}

function loadRequests(): EventApprovalRequest[] {
	if (!isBrowser()) {
		return [];
	}

	if (approvalRequestsCache) {
		return approvalRequestsCache;
	}

	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		approvalRequestsCache = [];
		return approvalRequestsCache;
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			approvalRequestsCache = [];
			return approvalRequestsCache;
		}

		approvalRequestsCache = parsed.filter(isRequest);
		return approvalRequestsCache;
	} catch {
		approvalRequestsCache = [];
		return approvalRequestsCache;
	}
}

function saveRequests(requests: EventApprovalRequest[]) {
	approvalRequestsCache = requests;

	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function emitChange() {
	const snapshot = getEventApprovalRequests();
	for (const listener of listeners) {
		listener(snapshot);
	}
}

export function subscribeEventApprovalRequests(listener: Listener) {
	listeners.add(listener);
	listener(getEventApprovalRequests());

	return () => {
		listeners.delete(listener);
	};
}

export function getEventApprovalRequests() {
	return [...loadRequests()];
}

export function submitEventApprovalRequest(
	input: SubmitEventApprovalRequestInput,
) {
	const now = new Date().toISOString();
	const request: EventApprovalRequest = {
		id: createId(),
		status: "PENDING",
		createdAt: now,
		updatedAt: now,
		submittedBy: input.submittedBy,
		eventId: input.eventId,
		draft: input.draft,
	};

	const next = [request, ...loadRequests()].slice(0, MAX_ITEMS);
	saveRequests(next);
	emitChange();
	return request;
}

export function reviewEventApprovalRequest(
	requestId: string,
	status: EventApprovalStatus,
	input: ReviewEventApprovalRequestInput,
) {
	const current = loadRequests();
	const now = new Date().toISOString();

	const next = current.map((request) => {
		if (request.id !== requestId) {
			return request;
		}

		return {
			...request,
			status,
			reviewedBy: input.reviewedBy,
			reviewNote: input.reviewNote,
			eventId: input.eventId,
			updatedAt: now,
		};
	});

	saveRequests(next);
	emitChange();
	return next.find((request) => request.id === requestId) ?? null;
}

export function deleteEventApprovalRequest(requestId: string) {
	const next = loadRequests().filter((request) => request.id !== requestId);
	saveRequests(next);
	emitChange();
}

export function clearEventApprovalRequests() {
	saveRequests([]);
	emitChange();
}
