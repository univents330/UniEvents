"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionTitle } from "@/shared/ui/section-title";
import { GoogleOAuthSection } from "../components/google-oauth-section";

export function SignInView() {
	const [error, setError] = useState("");

	return (
		<div className="mx-auto max-w-md space-y-8">
			<SectionTitle
				eyebrow="Welcome back"
				title="Sign in to UniEvents"
				description="Use Google to sign in. Email/password is currently disabled."
			/>

			<div className="panel space-y-5 p-6 md:p-8">
				{error && (
					<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-[#c53030] text-sm">
						{error}
					</div>
				)}

				<GoogleOAuthSection onError={setError} dividerLabel="google sign in" />

				<p className="text-center text-[#5f6984] text-sm">
					Email/password authentication is temporarily disabled.
				</p>

				<p className="text-center text-[#5f6984] text-sm">
					No account yet?{" "}
					<Link
						href="/auth/sign-up"
						className="font-semibold text-[#0f3dd9] hover:underline"
					>
						Create one
					</Link>
				</p>
			</div>
		</div>
	);
}
