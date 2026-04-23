"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { authClient } from "@/core/lib/auth-client";
import { Button } from "@/shared/ui/button";

type GoogleOAuthSectionProps = {
	callbackURL?: string;
	onError?: (message: string) => void;
	actionLabel?: string;
	dividerLabel?: string;
};

function resolveCallbackURL(callbackURL: string): string {
	return new URL(callbackURL, window.location.origin).toString();
}

export function GoogleOAuthSection({
	callbackURL = "/dashboard",
	onError,
	actionLabel = "Continue with Google",
	dividerLabel = "or continue with email",
}: GoogleOAuthSectionProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleGoogleSignIn() {
		onError?.("");
		setIsSubmitting(true);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: resolveCallbackURL(callbackURL),
			});
		} catch (error) {
			const message = getApiErrorMessage(
				error,
				"Unable to continue with Google.",
			);
			if (/account|email|exists|already/i.test(message)) {
				onError?.(
					"An account with this email already exists. Sign in with email/password, then connect Google from your profile.",
				);
			} else {
				onError?.(message);
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3 text-[#8a93ad]">
				<span className="h-px flex-1 bg-[#dbe4fa]" />
				<span className="whitespace-nowrap font-semibold text-[11px] uppercase tracking-[0.24em]">
					{dividerLabel}
				</span>
				<span className="h-px flex-1 bg-[#dbe4fa]" />
			</div>

			<Button
				type="button"
				variant="ghost"
				className="h-12 w-full justify-center gap-3 border border-[#dbe4fa] bg-white/90 shadow-[0_8px_24px_rgba(15,61,217,0.08)] hover:border-[#bfd0ff] hover:bg-[#f7faff]"
				onClick={handleGoogleSignIn}
				disabled={isSubmitting}
			>
				<span className="flex h-5 w-5 items-center justify-center">
					<svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
						<path
							fill="#EA4335"
							d="M24 9.5c3.54 0 6.72 1.23 9.22 3.25l6.92-6.92C35.98 2.02 30.37 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.06 6.25C12.54 13.5 17.84 9.5 24 9.5z"
						/>
						<path
							fill="#4285F4"
							d="M46.14 24.5c0-1.71-.15-3.36-.44-4.95H24v9.38h12.44c-.54 2.9-2.17 5.36-4.63 7.02l7.13 5.53c4.18-3.86 6.6-9.55 6.6-16.98z"
						/>
						<path
							fill="#FBBC05"
							d="M10.62 28.47c-.48-1.42-.76-2.93-.76-4.47s.27-3.05.76-4.47l-8.06-6.25C.92 16.45 0 20.08 0 24s.92 7.55 2.56 10.72l8.06-6.25z"
						/>
						<path
							fill="#34A853"
							d="M24 48c6.37 0 11.74-2.1 15.66-5.72l-7.13-5.53c-1.98 1.33-4.52 2.11-8.53 2.11-6.16 0-11.46-4-13.38-9.72l-8.06 6.25C6.51 42.62 14.62 48 24 48z"
						/>
					</svg>
				</span>
				<span>{isSubmitting ? "Connecting..." : actionLabel}</span>
			</Button>
		</div>
	);
}
