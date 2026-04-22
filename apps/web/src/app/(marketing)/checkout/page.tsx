import type { Metadata } from "next";
import { CheckoutView } from "@/modules/orders/views/checkout-view";

export const metadata: Metadata = {
	title: "Checkout | UniEvent",
	description:
		"Securely finalize your purchase and obtain your digital event passes.",
};

export default function CheckoutPage() {
	return <CheckoutView />;
}
