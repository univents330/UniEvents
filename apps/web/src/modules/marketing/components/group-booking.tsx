import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function GroupBooking() {
	return (
		<section className="w-full bg-[#EBF3FF] py-12">
			<div className={"mx-auto max-w-7xl px-6"}>
				<div className="group relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[48px] bg-[#030370] p-12 md:p-20 lg:flex-row">
					<div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/5 blur-3xl transition-transform duration-500 group-hover:scale-110" />
					<div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

					<div className="relative z-10 max-w-2xl text-center lg:text-left">
						<div className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 font-bold text-white text-xs uppercase tracking-wider backdrop-blur-md">
							Group Booking
						</div>

						<h2 className="mb-6 font-extrabold text-4xl text-white leading-tight tracking-tighter md:text-6xl">
							Coming with your crew?
							<br />
							Save more together.
						</h2>

						<p className="mb-10 font-medium text-lg text-slate-300 leading-relaxed md:text-xl">
							Book 5+ Tickets In A Single Transaction And Unlock Automatic
							Discounts. One Payment — Everyone Gets Their Own QR Pass
							Instantly.
						</p>

						<div className="inline-flex -rotate-1 transform items-center gap-3 rounded-3xl bg-white px-8 py-4 font-black text-[#030370] text-xl shadow-xl transition-transform group-hover:rotate-0 md:text-2xl">
							Get Upto 20% Off
						</div>
					</div>

					<div className="relative z-10 flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
						<Button
							asChild
							className="h-16 rounded-full bg-white px-10 font-bold text-[#030370] text-lg shadow-lg transition-all hover:bg-slate-100 active:scale-95"
						>
							<Link href="/events">
								Book Now <ArrowRight size={20} className="ml-2" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="h-16 rounded-full border-white/20 px-10 font-bold text-lg text-white backdrop-blur-sm transition-all hover:bg-white/10"
						>
							<Link
								href={{ pathname: "/faq", query: { tab: "group-booking" } }}
							>
								Learn More
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
