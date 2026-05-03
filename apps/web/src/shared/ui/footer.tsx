import Link from "next/link";

export function Footer() {
	return (
		<footer className="bg-[#030370] pt-20 pb-10 text-white">
			<div className="mx-auto max-w-7xl px-6">
				<div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
					<div className="lg:col-span-1">
						<h2 className="mb-6 font-black text-3xl tracking-tighter">
							UniEvent
						</h2>
						<p className="max-w-xs font-medium text-base text-blue-200 leading-relaxed">
							Discover and book events you'll actually love attending- college
							fests, tech talks, concerts, workshops & community meetups
						</p>
					</div>

					<div>
						<h3 className="mb-6 font-bold text-xl">Discover</h3>
						<div className="flex flex-col gap-4">
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Browse All Events
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Tech Events
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Music & Concerts
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								College Fests
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Free Events
							</Link>
						</div>
					</div>

					<div>
						<h3 className="mb-6 font-bold text-xl">Account</h3>
						<div className="flex flex-col gap-4">
							<Link
								href="/auth/sign-up?redirect=%2Fdiscover"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Sign Up Free
							</Link>
							<Link
								href="/auth/sign-in?redirect=%2Fdiscover"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Log in
							</Link>
							<Link
								href="/dashboard/tickets"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								My Bookings
							</Link>
							<Link
								href="/dashboard/passes"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								My Passes
							</Link>
							<Link
								href="/dashboard/profile"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Profile Settings
							</Link>
						</div>
					</div>

					<div>
						<h3 className="mb-6 font-bold text-xl">Help</h3>
						<div className="flex flex-col gap-4">
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Help Centre
							</Link>
							<Link
								// biome-ignore lint/suspicious/noExplicitAny: Workaround for Next.js 15 static route typing
								href={"/refund" as any}
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Refund Policy
							</Link>
							<Link
								// biome-ignore lint/suspicious/noExplicitAny: Workaround for Next.js 15 static route typing
								href={"/privacy" as any}
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Privacy Policy
							</Link>
							<Link
								// biome-ignore lint/suspicious/noExplicitAny: Workaround for Next.js 15 static route typing
								href={"/terms" as any}
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Terms of Service
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Contact Us
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Sponsor Request
							</Link>
							<Link
								href="/"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								About UniEvent
							</Link>
							<Link
								href="/events"
								className="font-medium text-blue-200 transition-colors hover:text-white"
							>
								Host an Event
							</Link>
						</div>
					</div>
				</div>

				<div className="mb-8 h-px w-full bg-white/10" />

				<div className="flex flex-col items-center justify-between gap-4 font-medium text-blue-200 text-sm md:flex-row">
					<div>© {new Date().getFullYear()} UniEvent. All rights reserved.</div>
					<div className="flex items-center gap-6">
						<Link
							// biome-ignore lint/suspicious/noExplicitAny: Workaround for Next.js 15 static route typing
							href={"/privacy" as any}
							className="transition-colors hover:text-white"
						>
							Privacy Policy
						</Link>
						<Link
							// biome-ignore lint/suspicious/noExplicitAny: Workaround for Next.js 15 static route typing
							href={"/terms" as any}
							className="transition-colors hover:text-white"
						>
							Terms of Service
						</Link>
						<Link
							// biome-ignore lint/suspicious/noExplicitAny: Workaround for Next.js 15 static route typing
							href={"/privacy" as any}
							className="transition-colors hover:text-white"
						>
							Cookie Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
