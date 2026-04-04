/**
 * Format a date to a localized string
 */
export function formatDate(date: Date | string | null | undefined): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Format a date to a short localized string
 */
export function formatDateShort(
	date: Date | string | null | undefined,
): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Format time only
 */
export function formatTime(date: Date | string | null | undefined): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(
	date: Date | string | null | undefined,
): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffMs = d.getTime() - now.getTime();
	const diffMins = Math.round(diffMs / 60000);
	const diffHours = Math.round(diffMs / 3600000);
	const diffDays = Math.round(diffMs / 86400000);

	if (Math.abs(diffMins) < 60) {
		return diffMins === 0
			? "now"
			: diffMins > 0
				? `in ${diffMins}m`
				: `${Math.abs(diffMins)}m ago`;
	}
	if (Math.abs(diffHours) < 24) {
		return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
	}
	return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
}
