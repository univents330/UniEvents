import { CheckoutAttendeePage } from "@/features/payments/components/checkout-attendee/checkout-attendee-page";

export default async function EventCheckoutPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	return <CheckoutAttendeePage slug={slug} />;
}
