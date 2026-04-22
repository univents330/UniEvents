"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionTitle } from "@/shared/ui/section-title";
import { GoogleOAuthSection } from "../components/google-oauth-section";

export function SignUpView() {
	const [error, setError] = useState("");

	return (
		<div className="mx-auto max-w-md space-y-8">
			<SectionTitle
				eyebrow="Get started"
				title="Create your account"
				description="Sign up with Google. Email/password is currently disabled."
			/>

			<div className="panel space-y-5 p-6 md:p-8">
				{error && (
					<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-[#c53030] text-sm">
						{error}
					</div>
				)}

				<GoogleOAuthSection
					onError={setError}
					actionLabel="Continue with Google"
					dividerLabel="google sign up"
				/>

				<p className="text-center text-[#5f6984] text-sm">
					Email/password registration is temporarily disabled.
				</p>

				<p className="text-center text-[#5f6984] text-sm">
					Already have an account?{" "}
					<Link
						href="/auth/sign-in"
						className="font-semibold text-[#0f3dd9] hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
