"use client";

import {
	GraduationCap,
	Laptop,
	Music,
	Palette,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
	{
		id: "tech-dev",
		title: "Tech & Dev",
		Icon: Laptop,
		bg: "bg-slate-50",
		color: "text-slate-900",
		count: 2,
	},
	{
		id: "music",
		title: "Music",
		Icon: Music,
		bg: "bg-blue-50",
		color: "text-blue-600",
		count: 0,
	},
	{
		id: "college-fests",
		title: "College Fests",
		Icon: GraduationCap,
		bg: "bg-orange-50",
		color: "text-orange-500",
		count: 0,
	},
	{
		id: "workshops",
		title: "Workshops",
		Icon: Users,
		bg: "bg-indigo-50",
		color: "text-indigo-600",
		count: 1,
	},
	{
		id: "art-culture",
		title: "Art & Culture",
		Icon: Palette,
		bg: "bg-pink-50",
		color: "text-pink-500",
		count: 0,
	},
	{
		id: "meetups",
		title: "Meetups",
		Icon: UserPlus,
		bg: "bg-emerald-50",
		color: "text-emerald-600",
		count: 1,
	},
];

export function EventCategories() {
	return (
		<section className="w-full bg-transparent py-24">
			<div className="mx-auto max-w-[1440px] px-6">
				<div className="mb-12 text-center md:text-left">
					<h2 className="mb-4 font-black text-4xl text-slate-900 tracking-tighter md:text-6xl">
						What are you <span className="text-blue-700">into?</span>
					</h2>
					<p className="font-bold text-slate-400 md:text-xl">
						Discover events by interest.
					</p>
				</div>

				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
					{CATEGORIES.map((category) => (
						<Link
							key={category.id}
							href={`/events?category=${category.id}`}
							className="group flex aspect-square w-full flex-col items-center justify-center rounded-[40px] border border-white/40 bg-white/60 p-6 text-center backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]"
						>
							<div
								className={`mb-6 rounded-3xl p-5 transition-transform duration-500 group-hover:scale-110 ${category.bg}`}
							>
								<category.Icon
									className={`h-10 w-10 stroke-[1.5] ${category.color}`}
								/>
							</div>
							<h3 className="mb-1.5 font-black text-base text-slate-900">
								{category.title}
							</h3>
							<span className="font-bold text-slate-400 text-xs uppercase tracking-widest">
								{category.count} events
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
