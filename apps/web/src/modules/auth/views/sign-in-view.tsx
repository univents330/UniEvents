"use client";

import { CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GoogleOAuthSection } from "../components/google-oauth-section";

export function SignInView() {
	const [error, setError] = useState("");

	return (
		<div className="flex min-h-screen w-full bg-transparent">
			{/* Left Side - Deep Navy Bleeding Gradient Pane */}
			<div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#050a30] p-48 lg:flex">
				{/* Atmospheric Bleeding Gradient & Grid */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#050a30] via-[#050a30] to-black opacity-100" />
				<div
					className="absolute inset-0 opacity-[0.05]"
					style={{
						backgroundImage:
							"linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>

				{/* Brand Orbs for Depth */}
				<div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
				<div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />

				<div className="relative z-10 h-full w-full">
					<Image
						src="/assets/welcome.png"
						alt="UniEvent Experience"
						fill
						className="object-contain"
						priority
					/>
				</div>

				{/* Branding on Top */}
				<div className="absolute top-12 left-12 z-20 flex items-center gap-3">
					<div className="relative h-10 w-10">
						<Image
							src="/assets/logo_circle_svg.svg"
							alt="Logo"
							fill
							className="object-contain"
						/>
					</div>
					<span className="font-black text-2xl text-white uppercase tracking-tighter">
						UniEvent
					</span>
				</div>

				{/* Testimonial/Value Prop - Restored White Typography */}
				<div className="absolute right-20 bottom-20 left-20 z-20 space-y-8">
					<div className="space-y-4">
						<h2 className="display-font font-black text-4xl text-white leading-tight tracking-tighter">
							Join the most vibrant <br /> campus community.
						</h2>
						<p className="font-bold text-blue-100/80 text-lg leading-relaxed">
							"UniEvent transformed how our society manages events. It's fast,
							secure, and incredibly easy to use."
						</p>
					</div>

					<div className="flex flex-col gap-3">
						{[
							"Scan tickets instantly with QR",
							"Real-time attendee analytics",
							"Secure student-only verification",
						].map((item) => (
							<div
								key={item}
								className="flex items-center gap-3 font-bold text-sm text-white/90"
							>
								<CheckCircle2 size={18} className="text-blue-400" />
								{item}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Right Side - Auth Form */}
			<div className="relative flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24 xl:px-32">
				{/* Back Link */}
				<Link
					href="/"
					className="group absolute top-12 left-8 flex items-center gap-2 font-black text-slate-400 text-xs uppercase tracking-widest transition-colors hover:text-slate-900 lg:left-24"
				>
					<ChevronLeft
						size={16}
						className="transition-transform group-hover:-translate-x-1"
					/>
					Back to home
				</Link>

				<div className="fade-in slide-in-from-bottom-6 mx-auto w-full max-w-[400px] animate-in duration-1000">
					<div className="mb-12">
						<h1 className="mb-4 font-black text-4xl text-slate-900 tracking-tighter">
							Sign In
						</h1>
						<p className="font-bold text-base text-slate-500">
							Welcome back! Please enter your details to access your dashboard.
						</p>
					</div>

					{error && (
						<div className="shake mb-8 animate-in rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-600 text-sm duration-500">
							{error}
						</div>
					)}

					<div className="space-y-8">
						<GoogleOAuthSection
							onError={setError}
							actionLabel="Continue with Google"
							dividerLabel="Secure Access"
						/>

						<div className="space-y-6">
							<p className="text-center font-bold text-slate-400 text-sm">
								New to the community?{" "}
								<Link
									href="/auth/sign-up"
									className="border-blue-600/10 border-b-2 text-blue-600 transition-colors hover:border-blue-600 hover:text-blue-700"
								>
									Create an account
								</Link>
							</p>
						</div>
					</div>

					{/* Simple Footer */}
					<div className="mt-20 border-slate-100 border-t pt-8">
						<p className="text-center font-black text-[10px] text-slate-300 uppercase tracking-[0.3em]">
							Your gateway to epic events
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
