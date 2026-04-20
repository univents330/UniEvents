export type CheckoutDraftItem = {
	tierId: string;
	quantity: number;
};

export type CheckoutDraftTicketHolder = {
	tierId: string;
	name: string;
	email: string;
	phone: string;
};

export type CheckoutDraft = {
	eventId: string;
	eventSlug: string;
	items: CheckoutDraftItem[];
	purchaserName: string;
	purchaserEmail: string;
	purchaserPhone: string;
	ticketHolders: CheckoutDraftTicketHolder[];
};

function storageKey(eventSlug: string) {
	return `voltaze_checkout_${eventSlug}`;
}

export function readCheckoutDraft(eventSlug: string): CheckoutDraft | null {
	if (typeof window === "undefined") {
		return null;
	}

	const raw = sessionStorage.getItem(storageKey(eventSlug));
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as CheckoutDraft;
	} catch {
		return null;
	}
}

export function writeCheckoutDraft(draft: CheckoutDraft) {
	if (typeof window === "undefined") {
		return;
	}

	sessionStorage.setItem(storageKey(draft.eventSlug), JSON.stringify(draft));
}

export function clearCheckoutDraft(eventSlug: string) {
	if (typeof window === "undefined") {
		return;
	}

	sessionStorage.removeItem(storageKey(eventSlug));
}
