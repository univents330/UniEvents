/**
 * Format a number as currency (INR by default for Razorpay)
 */
export function formatCurrency(
	amount: number | null | undefined,
	currency = "INR",
): string {
	if (amount === null || amount === undefined) return "";

	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
	}).format(amount);
}

/**
 * Format amount in paise to rupees
 * Razorpay uses paise (smallest unit), so divide by 100
 */
export function formatPaiseToRupees(paise: number | null | undefined): string {
	if (paise === null || paise === undefined) return "";
	return formatCurrency(paise / 100);
}

/**
 * Convert rupees to paise for Razorpay API
 */
export function rupeesToPaise(rupees: number): number {
	return Math.round(rupees * 100);
}
