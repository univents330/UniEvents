"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="relative overflow-hidden bg-gradient-to-b from-[#050a30] via-[#000020] to-black pt-24 pb-12 text-white">
			{/* Bleeding Light Effect */}
			<div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-full -translate-x-1/2 bg-blue-600/10 blur-[120px]" />
			<div className="mx-auto max-w-[1440px] px-6">
				<div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
					{/* Brand Column */}
					<div className="lg:col-span-2">
						<div className="mb-10 flex items-center gap-4">
							<div className="relative h-14 w-14 overflow-hidden">
								<Image
									src="/assets/logo_circle_svg.svg"
									alt="UniEvent Logo"
									fill
									className="object-contain"
								/>
							</div>
							<div>
								<span className="block font-black text-4xl text-white uppercase leading-none tracking-tighter">
									UniEvent
								</span>
								<span className="mt-2 font-black text-[11px] text-blue-200 uppercase tracking-[0.4em]">
									Official Platform
								</span>
							</div>
						</div>
						<p className="max-w-xs font-bold text-[16px] text-blue-100/60 leading-relaxed">
							The ultimate campus event platform. Discover and book events
							you'll actually love attending. Built by students, for students.
						</p>
					</div>

					{/* Links Columns */}
					<div className="lg:col-span-1">
						<h4 className="mb-8 inline-block border-white/10 border-b pb-2 font-black text-sm text-white uppercase tracking-widest">
							Discover
						</h4>
						<ul className="space-y-4">
							{[
								"Browse All Events",
								"Tech Events",
								"Music & Concerts",
								"College Fests",
								"Free Events",
							].map((item) => (
								<li key={item}>
									<Link
										href="#"
										className="font-bold text-[15px] text-blue-100/60 transition-colors hover:text-white"
									>
										{item}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="lg:col-span-1">
						<h4 className="mb-8 inline-block border-white/10 border-b pb-2 font-black text-sm text-white uppercase tracking-widest">
							Account
						</h4>
						<ul className="space-y-4">
							{[
								"Sign Up Free",
								"Log In",
								"My Bookings",
								"My Passes",
								"Profile Settings",
							].map((item) => (
								<li key={item}>
									<Link
										href="#"
										className="font-bold text-[15px] text-blue-100/60 transition-colors hover:text-white"
									>
										{item}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="lg:col-span-1">
						<h4 className="mb-8 inline-block border-white/10 border-b pb-2 font-black text-sm text-white uppercase tracking-widest">
							Help
						</h4>
						<ul className="space-y-4 text-[15px]">
							{[
								"Help Centre",
								"Refund Policy",
								"Privacy Policy",
								"Terms of Service",
								"Contact Us",
								"Sponsor Request",
								"About UniEvent",
								"Host an Event",
							].map((item) => (
								<li key={item}>
									<Link
										href="#"
										className="font-bold text-blue-100/60 transition-colors hover:text-white"
									>
										{item}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-24 flex flex-col items-center justify-between gap-6 border-white/10 border-t pt-8 sm:flex-row">
					<p className="font-bold text-[13px] text-blue-200/40">
						© 2026 UniEvent. All rights reserved.
					</p>
					<div className="flex flex-wrap justify-center gap-8">
						{["Privacy Policy", "Terms of service", "Cookie Policy"].map(
							(item) => (
								<Link
									key={item}
									href="#"
									className="font-bold text-[13px] text-blue-200/40 transition-colors hover:text-white"
								>
									{item}
								</Link>
							),
						)}
					</div>
				</div>
			</div>
		</footer>
	);
}
