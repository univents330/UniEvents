export default function TermsAndConditionsPage() {
	return (
		<div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
			<div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
				<h1 className="mb-6 font-extrabold text-3xl text-[#030370] md:text-5xl">
					Terms and Conditions
				</h1>

				<div className="space-y-8 text-gray-700">
					<p className="text-lg leading-relaxed">
						Welcome to UNIEVENTS. By accessing or using our platform, you agree
						to comply with and be bound by the following Terms and Conditions.
					</p>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							1. Platform Usage
						</h2>
						<p>
							UNIEVENTS provides a platform for users to discover events, book
							tickets, and for organizers to create and manage events. Users
							agree to use the platform only for lawful purposes.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							2. User Accounts
						</h2>
						<p>
							Users may be required to create an account to access certain
							features. You are responsible for maintaining the confidentiality
							of your account credentials and for all activities under your
							account.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							3. Event Listings
						</h2>
						<p>
							Event organizers are solely responsible for the accuracy of event
							details, including date, time, venue, and pricing. UNIEVENTS is
							not responsible for any changes, cancellations, or inaccuracies in
							event information.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							4. Ticketing and Payments
						</h2>
						<p>
							All payments are processed through secure third-party payment
							gateways. UNIEVENTS does not store any card or banking details.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							5. Cancellation and Refunds
						</h2>
						<p>
							Refunds and cancellations are subject to the policies defined by
							the event organizer. UNIEVENTS is not responsible for refund
							decisions but may assist in communication where required.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							6. Certificates and Digital Services
						</h2>
						<p>
							Certificates and other digital services provided through the
							platform are generated based on the data provided by users and
							organizers. UNIEVENTS is not responsible for incorrect information
							submitted.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							7. Prohibited Activities
						</h2>
						<p className="mb-2">Users agree not to:</p>
						<ul className="list-inside list-disc space-y-1">
							<li>Use the platform for fraudulent activities</li>
							<li>Upload false or misleading information</li>
							<li>Attempt to disrupt or harm the platform</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							8. Intellectual Property
						</h2>
						<p>
							All content, branding, and technology on UNIEVENTS are the
							property of the platform and may not be copied or reused without
							permission.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							9. Limitation of Liability
						</h2>
						<p>
							UNIEVENTS shall not be held liable for any direct or indirect
							damages arising from the use of the platform, including event
							cancellations or technical issues.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							10. Termination
						</h2>
						<p>
							We reserve the right to suspend or terminate user accounts that
							violate these terms without prior notice.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							11. Changes to Terms
						</h2>
						<p>
							UNIEVENTS may update these Terms and Conditions at any time.
							Continued use of the platform constitutes acceptance of the
							updated terms.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							12. Governing Law
						</h2>
						<p>
							These Terms shall be governed by and interpreted in accordance
							with the laws of India.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">13. Contact</h2>
						<p className="mb-2">For any queries, contact us at:</p>
						<p className="font-semibold">
							Email:{" "}
							<a
								href="mailto:contactt@unievent.in"
								className="text-[#030370] hover:underline"
							>
								contactt@unievent.in
							</a>
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
