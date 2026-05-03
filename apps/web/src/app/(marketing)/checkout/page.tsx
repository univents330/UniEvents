import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/modules/orders/views/checkout-view";

export const metadata: Metadata = {
	title: "Checkout | UniEvent",
	description:
		"Securely finalize your purchase and obtain your digital event passes.",
};

export default function CheckoutPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-slate-50">
					<div className="text-center">
						<div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
						<p className="mt-4 text-slate-600 text-sm">Loading checkout...</p>
					</div>
				</div>
			}
		>
			<CheckoutView />
		</Suspense>
	);
}
