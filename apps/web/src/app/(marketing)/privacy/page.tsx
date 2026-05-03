export default function PrivacyPolicyPage() {
	return (
		<div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
			<div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
				<h1 className="mb-6 font-extrabold text-3xl text-[#030370] md:text-5xl">
					Privacy Policy
				</h1>

				<div className="space-y-8 text-gray-700">
					<p className="text-lg leading-relaxed">
						At UNIEVENTS, we value your privacy and are committed to protecting
						your personal information. This Privacy Policy explains how we
						collect, use, and safeguard your data when you use our platform.
					</p>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							1. Information We Collect
						</h2>
						<p className="mb-2">We may collect the following information:</p>
						<ul className="list-inside list-disc space-y-1">
							<li>Name, email address, and phone number</li>
							<li>College or organization details</li>
							<li>Event participation and ticket information</li>
							<li>
								Payment-related information (processed via third-party services)
							</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							2. How We Use Your Information
						</h2>
						<p className="mb-2">We use the collected data to:</p>
						<ul className="list-inside list-disc space-y-1">
							<li>Enable event registration and ticket booking</li>
							<li>Process payments securely</li>
							<li>Generate certificates and provide event-related services</li>
							<li>
								Communicate updates, notifications, and important information
							</li>
							<li>Improve our platform and user experience</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							3. Payment Processing
						</h2>
						<p>
							We use secure third-party payment gateways to process payments. We
							do not store your card or banking details on our servers.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							4. Data Sharing
						</h2>
						<p className="mb-2">
							We do not sell or rent your personal data. However, we may share
							limited information with trusted third-party services such as:
						</p>
						<ul className="list-inside list-disc space-y-1">
							<li>Payment gateways</li>
							<li>Email and notification service providers</li>
						</ul>
						<p className="mt-2 text-gray-500 text-sm">
							only to operate and improve our platform.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							5. Data Security
						</h2>
						<p>
							We implement reasonable security measures to protect your
							information from unauthorized access, misuse, or disclosure.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">6. Cookies</h2>
						<p>
							We may use cookies and similar technologies to enhance user
							experience and improve our services.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							7. User Rights
						</h2>
						<p>
							Users may request access, correction, or deletion of their
							personal data by contacting us.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							8. Third-Party Links
						</h2>
						<p>
							Our platform may contain links to third-party websites. We are not
							responsible for their privacy practices.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							9. Changes to This Policy
						</h2>
						<p>
							We may update this Privacy Policy from time to time. Users are
							advised to review this page periodically.
						</p>
					</section>

					<section>
						<h2 className="mb-3 font-bold text-2xl text-black">
							10. Contact Us
						</h2>
						<p className="mb-2">
							If you have any questions or concerns regarding this Privacy
							Policy, you can contact us at:
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

					<div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-4 text-center font-medium text-gray-800">
						By using our platform, you agree to this Privacy Policy.
					</div>
				</div>
			</div>
		</div>
	);
}
