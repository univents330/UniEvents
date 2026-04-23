"use client";

import { CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { authClient } from "@/core/lib/auth-client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { GoogleOAuthSection } from "../components/google-oauth-section";

export function SignUpView() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	async function handleEmailSignUp(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await authClient.signUp.email({
				name: name.trim(),
				email: email.trim().toLowerCase(),
				password,
				callbackURL: "/dashboard",
			});

			if (response.error) {
				setError(response.error.message || "Unable to create your account.");
				return;
			}

			router.push("/dashboard");
			router.refresh();
		} catch (submitError) {
			setError(
				getApiErrorMessage(submitError, "Unable to create your account."),
			);
		} finally {
			setIsSubmitting(false);
		}
	}

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

				{/* Value Prop - Restored White Typography */}
				<div className="absolute right-20 bottom-20 left-20 z-20 space-y-8">
					<div className="space-y-4">
						<h2 className="display-font font-black text-4xl text-white leading-tight tracking-tighter">
							Start your journey <br /> with UniEvent.
						</h2>
						<p className="font-bold text-blue-100/80 text-lg leading-relaxed">
							Create an account to unlock access to student-exclusive festivals,
							workshops, and networking meetups.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						{[
							"Verified student-only environment",
							"Early bird access to campus fests",
							"Seamless digital ticketing system",
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
			<div className="relative flex min-h-screen w-full flex-col items-center justify-center px-8 py-12 lg:w-1/2 lg:px-24 lg:py-14 xl:px-32">
				{/* Back Link */}
				<Link
					href="/"
					className="group absolute top-6 left-8 flex items-center gap-2 font-black text-slate-400 text-xs uppercase tracking-widest transition-colors hover:text-slate-900 lg:top-12 lg:left-24"
				>
					<ChevronLeft
						size={16}
						className="transition-transform group-hover:-translate-x-1"
					/>
					Back to home
				</Link>

				<div className="fade-in slide-in-from-bottom-6 mx-auto mt-6 w-full max-w-[380px] animate-in duration-1000 lg:mt-8">
					<div className="mb-8">
						<h1 className="mb-3 font-black text-3xl text-slate-900 tracking-tighter lg:text-4xl">
							Create Account
						</h1>
						<p className="font-bold text-[15px] text-slate-500">
							Join thousands of students and start experiencing campus like
							never before.
						</p>
					</div>

					{error && (
						<div className="shake mb-8 animate-in rounded-xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-600 text-sm duration-500">
							{error}
						</div>
					)}

					<div className="space-y-6">
						<form className="space-y-3" onSubmit={handleEmailSignUp}>
							<div className="space-y-2">
								<label
									htmlFor="sign-up-name"
									className="font-bold text-[11px] text-slate-500 uppercase tracking-[0.2em]"
								>
									Full name
								</label>
								<Input
									id="sign-up-name"
									type="text"
									className="h-10"
									autoComplete="name"
									required
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder="Your full name"
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="sign-up-email"
									className="font-bold text-[11px] text-slate-500 uppercase tracking-[0.2em]"
								>
									Email
								</label>
								<Input
									id="sign-up-email"
									type="email"
									className="h-10"
									autoComplete="email"
									required
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder="you@university.edu"
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="sign-up-password"
									className="font-bold text-[11px] text-slate-500 uppercase tracking-[0.2em]"
								>
									Password
								</label>
								<Input
									id="sign-up-password"
									type="password"
									className="h-10"
									autoComplete="new-password"
									required
									minLength={8}
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									placeholder="Minimum 8 characters"
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="sign-up-confirm-password"
									className="font-bold text-[11px] text-slate-500 uppercase tracking-[0.2em]"
								>
									Confirm password
								</label>
								<Input
									id="sign-up-confirm-password"
									type="password"
									className="h-10"
									autoComplete="new-password"
									required
									minLength={8}
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									placeholder="Repeat your password"
								/>
							</div>

							<Button
								type="submit"
								size="md"
								className="h-11 w-full"
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Creating account..."
									: "Create account with Email"}
							</Button>
						</form>

						<GoogleOAuthSection
							onError={setError}
							actionLabel="Sign up with Google"
							dividerLabel="or use Google"
						/>

						<div className="space-y-6">
							<p className="text-center font-bold text-slate-400 text-sm">
								Already have an account?{" "}
								<Link
									href="/auth/sign-in"
									className="border-blue-600/10 border-b-2 text-blue-600 transition-colors hover:border-blue-600 hover:text-blue-700"
								>
									Log in
								</Link>
							</p>
						</div>
					</div>

					{/* Simple Footer */}
					<div className="mt-6 border-slate-100 border-t pt-4 lg:mt-8 lg:pt-6">
						<p className="text-center font-black text-[10px] text-slate-300 uppercase tracking-[0.3em]">
							Your gateway to epic events
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
