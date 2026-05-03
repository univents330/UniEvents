import { CheckoutView } from "@/modules/orders/views/checkout-view";

export default async function EventCheckoutPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <CheckoutView eventId={id} />;
}
