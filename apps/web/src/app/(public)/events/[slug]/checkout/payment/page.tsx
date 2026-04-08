import { CheckoutPaymentPage } from "@/features/payments/components/checkout-payment/checkout-payment-page";

export default async function EventCheckoutPaymentPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	return <CheckoutPaymentPage slug={slug} />;
}
