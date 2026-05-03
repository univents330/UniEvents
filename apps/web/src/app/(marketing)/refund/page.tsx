export default function RefundPolicyPage() {
	return (
		<div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
			<div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
				<h1 className="mb-6 font-extrabold text-3xl text-[#030370] md:text-5xl">
					Refund & Cancellation Policy
				</h1>

				<div className="space-y-8 text-gray-700">
					<p className="text-lg leading-relaxed">
						At UNIEVENTS, we aim to provide a smooth experience for both users
						and event organizers. This policy outlines the terms related to
						cancellations and refunds.
					</p>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							1. Event-Based Refunds
						</h2>
						<p>
							All ticket purchases made through UNIEVENTS are subject to the
							refund and cancellation policies defined by the respective event
							organizers.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							2. Organizer Responsibility
						</h2>
						<p>
							Event organizers are solely responsible for deciding whether
							refunds are applicable in case of event cancellation,
							rescheduling, or other changes.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							3. Platform Role
						</h2>
						<p>
							UNIEVENTS acts only as a platform to facilitate event discovery
							and ticket booking. We do not guarantee refunds unless explicitly
							stated by the event organizer.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							4. Non-Refundable Cases
						</h2>
						<p className="mb-2">
							Refunds will not be provided in the following cases:
						</p>
						<ul className="list-inside list-disc space-y-1">
							<li>Change of personal plans</li>
							<li>Failure to attend the event</li>
							<li>Incorrect details provided by the user</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							5. Event Cancellation
						</h2>
						<p>
							If an event is canceled by the organizer, the refund (if
							applicable) will be processed as per the organizer's policy.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							6. Processing Time
						</h2>
						<p>
							If a refund is approved, it may take 5–10 business days for the
							amount to reflect in the original payment method.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							7. Service Fees
						</h2>
						<p>Platform or convenience fees (if any) may be non-refundable.</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">8. Contact</h2>
						<p className="mb-2">
							For any refund-related queries, users may contact:
						</p>
						<p className="font-semibold">
							Email:{" "}
							<a
								href="mailto:support@unievents.in"
								className="text-[#030370] hover:underline"
							>
								support@unievents.in
							</a>
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
