export type AppNotificationColor = "green" | "red" | "blue" | "amber";

export type AppNotification = {
	id: string;
	title: string;
	message?: string;
	color: AppNotificationColor;
	createdAt: string;
	isRead: boolean;
};

type NotificationInput = {
	title: string;
	message?: string;
	color?: AppNotificationColor;
};

type Listener = (items: AppNotification[]) => void;

const STORAGE_KEY_PREFIX = "voltaze:notifications";
const MAX_ITEMS = 60;
const DEDUPE_WINDOW_MS = 8000;
const DEFAULT_SCOPE = "guest";

let notificationsCache: AppNotification[] | null = null;
let activeScope = DEFAULT_SCOPE;
const listeners = new Set<Listener>();

function getStorageKey(scope = activeScope) {
	return `${STORAGE_KEY_PREFIX}:${scope}`;
}

function isBrowser() {
	return typeof window !== "undefined";
}

function loadNotificationsForScope(scope: string): AppNotification[] {
	if (!isBrowser()) {
		return [];
	}

	const raw = window.localStorage.getItem(getStorageKey(scope));
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed.filter((item): item is AppNotification => {
			return (
				typeof item === "object" &&
				item !== null &&
				typeof item.id === "string" &&
				typeof item.title === "string" &&
				typeof item.createdAt === "string" &&
				typeof item.isRead === "boolean"
			);
		});
	} catch {
		return [];
	}
}

function saveNotificationsForScope(scope: string, items: AppNotification[]) {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(getStorageKey(scope), JSON.stringify(items));

	if (scope === activeScope) {
		notificationsCache = items;
	}
}

function loadNotifications(): AppNotification[] {
	if (!isBrowser()) {
		return [];
	}

	if (notificationsCache) {
		return notificationsCache;
	}

	const raw = window.localStorage.getItem(getStorageKey());
	if (!raw) {
		notificationsCache = [];
		return notificationsCache;
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			notificationsCache = [];
			return notificationsCache;
		}

		notificationsCache = parsed.filter((item): item is AppNotification => {
			return (
				typeof item === "object" &&
				item !== null &&
				typeof item.id === "string" &&
				typeof item.title === "string" &&
				typeof item.createdAt === "string" &&
				typeof item.isRead === "boolean"
			);
		});
		return notificationsCache;
	} catch {
		notificationsCache = [];
		return notificationsCache;
	}
}

function saveNotifications(items: AppNotification[]) {
	notificationsCache = items;
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(getStorageKey(), JSON.stringify(items));
}

function emitChange() {
	const snapshot = getNotifications();
	for (const listener of listeners) {
		listener(snapshot);
	}
}

export function subscribeNotifications(listener: Listener) {
	listeners.add(listener);
	listener(getNotifications());

	return () => {
		listeners.delete(listener);
	};
}

export function setNotificationScope(scope: string | null | undefined) {
	const nextScope = scope?.trim() || DEFAULT_SCOPE;

	if (nextScope === activeScope) {
		return;
	}

	activeScope = nextScope;
	notificationsCache = null;
	emitChange();
}

export function getNotifications() {
	return [...loadNotifications()];
}

export function addNotification(input: NotificationInput) {
	const current = loadNotifications();
	const now = Date.now();
	const normalizedMessage = input.message?.trim() || "";

	const alreadyExists = current.some((item) => {
		const isSameContent =
			item.title === input.title &&
			(item.message?.trim() || "") === normalizedMessage &&
			item.color === (input.color ?? "green");

		if (!isSameContent) {
			return false;
		}

		const createdAtMs = new Date(item.createdAt).getTime();
		return (
			Number.isFinite(createdAtMs) && now - createdAtMs <= DEDUPE_WINDOW_MS
		);
	});

	if (alreadyExists) {
		return;
	}

	const nextItem: AppNotification = {
		id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		title: input.title,
		message: input.message,
		color: input.color ?? "green",
		createdAt: new Date().toISOString(),
		isRead: false,
	};

	const next = [nextItem, ...current].slice(0, MAX_ITEMS);
	saveNotifications(next);
	emitChange();
}

export function addNotificationToScope(
	scope: string,
	input: NotificationInput,
) {
	if (!scope?.trim()) {
		return;
	}

	const current = loadNotificationsForScope(scope);
	const now = Date.now();
	const normalizedMessage = input.message?.trim() || "";

	const alreadyExists = current.some((item) => {
		const isSameContent =
			item.title === input.title &&
			(item.message?.trim() || "") === normalizedMessage &&
			item.color === (input.color ?? "green");

		if (!isSameContent) {
			return false;
		}

		const createdAtMs = new Date(item.createdAt).getTime();
		return (
			Number.isFinite(createdAtMs) && now - createdAtMs <= DEDUPE_WINDOW_MS
		);
	});

	if (alreadyExists) {
		return;
	}

	const nextItem: AppNotification = {
		id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		title: input.title,
		message: input.message,
		color: input.color ?? "green",
		createdAt: new Date().toISOString(),
		isRead: false,
	};

	const next = [nextItem, ...current].slice(0, MAX_ITEMS);
	saveNotificationsForScope(scope, next);

	if (scope === activeScope) {
		emitChange();
	}
}

export function addNotificationToAllScopes(input: NotificationInput) {
	if (!isBrowser()) {
		return;
	}

	const knownScopes = new Set<string>([activeScope, DEFAULT_SCOPE]);

	for (let index = 0; index < window.localStorage.length; index += 1) {
		const key = window.localStorage.key(index);
		if (!key?.startsWith(`${STORAGE_KEY_PREFIX}:`)) {
			continue;
		}

		const scope = key.slice(`${STORAGE_KEY_PREFIX}:`.length);
		if (scope) {
			knownScopes.add(scope);
		}
	}

	for (const scope of knownScopes) {
		addNotificationToScope(scope, input);
	}
}

export function markNotificationAsRead(id: string) {
	const current = loadNotifications();
	const next = current.map((item) =>
		item.id === id ? { ...item, isRead: true } : item,
	);
	saveNotifications(next);
	emitChange();
}

export function markAllNotificationsAsRead() {
	const current = loadNotifications();
	const next = current.map((item) => ({ ...item, isRead: true }));
	saveNotifications(next);
	emitChange();
}

export function clearNotifications() {
	saveNotifications([]);
	emitChange();
}

export function getUnreadNotificationCount() {
	return loadNotifications().filter((item) => !item.isRead).length;
}
