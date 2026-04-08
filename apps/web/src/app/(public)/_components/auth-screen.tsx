"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useGoogleSignIn, useLogin, useRegister } from "@/features/auth";

type AuthMode = "login" | "signup" | "register";

type AuthCopy = {
	heading: string;
	submitLabel: string;
};

type PasswordRule = {
	label: string;
	check: (value: string) => boolean;
};

type FieldName = "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;

const AUTH_COPY: Record<AuthMode, AuthCopy> = {
	login: {
		heading: "Log in",
		submitLabel: "Log in",
	},
	signup: {
		heading: "Sign up",
		submitLabel: "Sign up",
	},
	register: {
		heading: "Sign up",
		submitLabel: "Sign up",
	},
};

const PASSWORD_RULES: PasswordRule[] = [
	{
		label: "At least 8 characters",
		check: (value) => value.length >= 8,
	},
	{
		label: "Starts with a capital letter",
		check: (value) => /^[A-Z]/.test(value),
	},
	{
		label: "Contains at least one number",
		check: (value) => /\d/.test(value),
	},
	{
		label: "Contains one special character",
		check: (value) => /[^A-Za-z0-9]/.test(value),
	},
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractErrorMessage(error: unknown): string | null {
	if (!error) {
		return null;
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "object") {
		const maybeRecord = error as Record<string, unknown>;
		const fromMessage = maybeRecord.message;
		if (typeof fromMessage === "string") {
			return fromMessage;
		}

		const maybeNestedError = maybeRecord.error;
		if (
			typeof maybeNestedError === "object" &&
			maybeNestedError !== null &&
			typeof (maybeNestedError as Record<string, unknown>).message === "string"
		) {
			return (maybeNestedError as Record<string, string>).message;
		}

		const maybeData = maybeRecord.data;
		if (
			typeof maybeData === "object" &&
			maybeData !== null &&
			typeof (maybeData as Record<string, unknown>).message === "string"
		) {
			return (maybeData as Record<string, string>).message;
		}
	}

	if (typeof error === "string") {
		return error;
	}

	return null;
}

function getFriendlyAuthErrorMessage(error: unknown): string {
	const rawMessage =
		extractErrorMessage(error)?.toLowerCase() || "unable to sign in";

	if (rawMessage.includes("invalid") || rawMessage.includes("credential")) {
		return "Incorrect email or password. Please try again.";
	}

	if (rawMessage.includes("verify") || rawMessage.includes("unverified")) {
		return "Please verify your email before logging in.";
	}

	if (rawMessage.includes("too many") || rawMessage.includes("rate limit")) {
		return "Too many login attempts. Please wait a minute and try again.";
	}

	if (
		rawMessage.includes("network") ||
		rawMessage.includes("fetch") ||
		rawMessage.includes("timeout")
	) {
		return "Network issue detected. Check your connection and try again.";
	}

	if (rawMessage.includes("server") || rawMessage.includes("500")) {
		return "Server error while signing in. Please try again shortly.";
	}

	return "Login failed. Please try again.";
}

function getOAuthLoginError(searchParams: URLSearchParams): string | null {
	const oauthError = searchParams.get("error")?.toLowerCase();
	if (!oauthError) {
		return null;
	}

	if (oauthError.includes("access_denied")) {
		return "Google sign-in was cancelled.";
	}

	if (oauthError.includes("callback") || oauthError.includes("oauth")) {
		return "Google sign-in could not be completed. Please try again.";
	}

	return "Authentication failed. Please try again.";
}

function PasswordRuleItem({
	label,
	isMet,
	isActive,
}: {
	label: string;
	isMet: boolean;
	isActive: boolean;
}) {
	return (
		<li
			className={`flex items-center gap-2 text-xs transition-all duration-300 ${
				isMet
					? "text-emerald-700"
					: isActive
						? "text-slate-700"
						: "text-slate-500"
			}`}
		>
			<span
				className={`inline-flex h-4 w-4 items-center justify-center rounded-full border font-semibold text-[10px] transition-all duration-300 ${
					isMet
						? "scale-100 border-emerald-600 bg-emerald-600 text-white"
						: "scale-95 border-slate-300 bg-white text-slate-400"
				}`}
			>
				{isMet ? "\u2713" : "\u2022"}
			</span>
			<span>{label}</span>
		</li>
	);
}

function GoogleMark() {
	return (
		<svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
			<path
				fill="#FFC107"
				d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.367 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.843 1.154 7.967 3.038l5.657-5.657C34.056 6.053 29.33 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"
			/>
			<path
				fill="#FF3D00"
				d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.843 1.154 7.967 3.038l5.657-5.657C34.056 6.053 29.33 4 24 4c-7.682 0-14.277 4.337-17.694 10.691Z"
			/>
			<path
				fill="#4CAF50"
				d="M24 44c5.223 0 9.94-1.999 13.518-5.239l-6.247-5.286C29.227 35.091 26.786 36 24 36c-5.346 0-9.625-3.327-11.282-7.946l-6.52 5.018C9.57 39.556 16.227 44 24 44Z"
			/>
			<path
				fill="#1976D2"
				d="M43.611 20.083H42V20H24v8h11.303a11.99 11.99 0 0 1-4.032 5.476l.003-.002 6.247 5.286C36.078 36.423 40 30.48 40 24c0-1.341-.138-2.651-.389-3.917Z"
			/>
		</svg>
	);
}

export function AuthScreen({ mode }: { mode: AuthMode }) {
	const copy = AUTH_COPY[mode];
	const isSignup = mode === "signup" || mode === "register";
	const searchParams = useSearchParams();
	const redirectParam = searchParams.get("redirect")?.trim();
	const redirectTo = redirectParam || "/";
	const authRedirectQuery = redirectParam
		? { redirect: redirectTo }
		: undefined;
	const signupHref = authRedirectQuery
		? { pathname: "/signup", query: authRedirectQuery }
		: "/signup";
	const loginHref = authRedirectQuery
		? { pathname: "/login", query: authRedirectQuery }
		: "/login";
	const loginMutation = useLogin({ redirectTo });
	const registerMutation = useRegister({ redirectTo });
	const googleMutation = useGoogleSignIn();
	const mutation = mode === "login" ? loginMutation : registerMutation;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const oauthError = mode === "login" ? getOAuthLoginError(searchParams) : null;
	const passwordRuleStates = PASSWORD_RULES.map((rule) => ({
		label: rule.label,
		isMet: rule.check(password),
	}));
	const isPasswordValid = passwordRuleStates.every((rule) => rule.isMet);

	function clearFieldError(field: FieldName) {
		setFieldErrors((current) => {
			if (!current[field]) {
				return current;
			}

			const next = { ...current };
			delete next[field];
			return next;
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setSubmitError(null);

		const nextFieldErrors: FieldErrors = {};
		const normalizedEmail = email.trim();
		const normalizedPassword = password.trim();

		if (!normalizedEmail) {
			nextFieldErrors.email = "Email is required.";
		} else if (!EMAIL_PATTERN.test(normalizedEmail)) {
			nextFieldErrors.email = "Enter a valid email address.";
		}

		if (!normalizedPassword) {
			nextFieldErrors.password = "Password is required.";
		}

		if (Object.keys(nextFieldErrors).length > 0) {
			setFieldErrors(nextFieldErrors);
			return;
		}

		setFieldErrors({});

		if (isSignup && password !== confirmPassword) {
			setFormError("Passwords do not match.");
			return;
		}

		if (isSignup && !isPasswordValid) {
			setFormError("Password does not meet all requirements.");
			return;
		}

		const payload = {
			email: normalizedEmail,
			password,
		};

		mutation.mutate(payload, {
			onError: (error) => {
				setSubmitError(getFriendlyAuthErrorMessage(error));
			},
		});
	}

	function handleGoogleSignIn() {
		googleMutation.mutate(redirectTo);
	}

	return (
		<main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(75,114,236,0.14),transparent_40%),linear-gradient(180deg,#eef3ff_0%,#e9efff_100%)] px-5 py-5 sm:px-8 sm:py-8">
			<section className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-4xl items-center justify-center">
				<div className="relative w-full overflow-hidden rounded-3xl border border-[#d6def5] bg-white shadow-[0_24px_60px_rgba(10,28,88,0.12)]">
					<Link
						href="/"
						aria-label="Close auth screen"
						className="absolute top-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-[#1a39a8]"
					>
						<span aria-hidden="true" className="text-2xl leading-none">
							×
						</span>
					</Link>

					<div className="grid min-h-[min(36rem,calc(100vh-5rem))] grid-cols-1 md:grid-cols-[46%_54%]">
						<div className="relative hidden border-slate-200 border-r bg-white p-8 md:flex md:flex-col md:justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d8e1fb] bg-white">
									<Image
										src="/assets/logo.webp"
										alt="UniEvent logo"
										width={30}
										height={30}
										className="h-7.5 w-7.5 object-contain"
										priority
									/>
								</div>
								<div>
									<p className="font-bold text-[#112c8f] text-lg tracking-tight">
										UniEvent
									</p>
								</div>
							</div>

							<div className="relative mx-auto h-96 w-full max-w-88">
								<Image
									src="/assets/welcome.png"
									alt="Welcome illustration"
									fill
									priority
									sizes="(max-width: 768px) 0px, 352px"
									className="object-contain"
								/>
							</div>

							<div className="h-5" />
						</div>

						<div className="relative flex flex-col justify-center px-5 py-6 pt-32 pb-7 sm:px-8 sm:pt-32 md:px-10 md:pt-16">
							<div className="absolute top-14 right-5 left-5 flex items-center justify-between sm:right-8 sm:left-8 md:right-10 md:left-10">
								<div className="flex items-center gap-2 md:hidden">
									<Image
										src="/assets/logo.webp"
										alt="UniEvent logo"
										width={28}
										height={28}
										className="h-7 w-7 object-contain"
										priority
									/>
									<span className="font-bold text-[#112c8f] text-lg">
										UniEvent
									</span>
								</div>

								<div className="ml-auto inline-flex rounded-full border border-[#d8e1fb] bg-[#f5f8ff] p-1 shadow-sm">
									<Link
										href={signupHref}
										className={`rounded-full px-5 py-2 font-semibold text-sm transition-colors ${
											mode === "signup" || mode === "register"
												? "bg-[#1e43bf] text-white"
												: "text-[#1e43bf] hover:bg-white"
										}`}
									>
										Sign Up
									</Link>
									<Link
										href={loginHref}
										className={`rounded-full px-5 py-2 font-semibold text-sm transition-colors ${
											mode === "login"
												? "bg-[#1e43bf] text-white"
												: "text-[#1e43bf] hover:bg-white"
										}`}
									>
										Log In
									</Link>
								</div>
							</div>

							<h1 className="mb-4 font-bold text-3xl text-slate-950">
								{copy.heading}
							</h1>

							<form className="space-y-3" onSubmit={handleSubmit}>
								<div className="space-y-2">
									<label
										htmlFor={`${mode}-email`}
										className="font-medium text-slate-700 text-sm"
									>
										Email address
									</label>
									<input
										id={`${mode}-email`}
										name="email"
										type="email"
										autoComplete="email"
										required
										value={email}
										onChange={(event) => {
											setEmail(event.target.value);
											clearFieldError("email");
											if (submitError) {
												setSubmitError(null);
											}
										}}
										placeholder="you@example.com"
										className={`h-11 w-full rounded-xl border bg-white px-3.5 text-slate-950 outline-none transition-shadow placeholder:text-slate-400 focus:ring-4 focus:ring-[#2f57db]/10 ${
											fieldErrors.email
												? "border-red-400 focus:border-red-500"
												: "border-slate-200 focus:border-[#2f57db]"
										}`}
									/>
									{fieldErrors.email ? (
										<p className="text-red-600 text-xs">{fieldErrors.email}</p>
									) : null}
								</div>

								<div className="space-y-2">
									<label
										htmlFor={`${mode}-password`}
										className="font-medium text-slate-700 text-sm"
									>
										Password
									</label>
									<input
										id={`${mode}-password`}
										name="password"
										type="password"
										autoComplete={
											mode === "login" ? "current-password" : "new-password"
										}
										required
										value={password}
										onChange={(event) => {
											setPassword(event.target.value);
											clearFieldError("password");
											if (submitError) {
												setSubmitError(null);
											}
										}}
										placeholder="Enter your password"
										className={`h-11 w-full rounded-xl border bg-white px-3.5 text-slate-950 outline-none transition-shadow placeholder:text-slate-400 focus:ring-4 focus:ring-[#2f57db]/10 ${
											fieldErrors.password
												? "border-red-400 focus:border-red-500"
												: "border-slate-200 focus:border-[#2f57db]"
										}`}
									/>
									{fieldErrors.password ? (
										<p className="text-red-600 text-xs">
											{fieldErrors.password}
										</p>
									) : null}

									{isSignup ? (
										<div
											className={`overflow-hidden rounded-xl border border-[#dfe7fb] bg-[#f8faff] px-3 py-2.5 transition-all duration-300 ${
												password.length > 0
													? "max-h-40 opacity-100"
													: "max-h-0 border-transparent px-0 py-0 opacity-0"
											}`}
										>
											<p className="mb-2 font-medium text-[11px] text-slate-500 uppercase tracking-[0.12em]">
												Password strength rules
											</p>
											<ul className="grid gap-1.5">
												{passwordRuleStates.map((rule) => (
													<PasswordRuleItem
														key={rule.label}
														label={rule.label}
														isMet={rule.isMet}
														isActive={password.length > 0}
													/>
												))}
											</ul>
										</div>
									) : null}
								</div>

								{isSignup ? (
									<div className="space-y-2">
										<label
											htmlFor={`${mode}-confirm-password`}
											className="font-medium text-slate-700 text-sm"
										>
											Re-enter password
										</label>
										<input
											id={`${mode}-confirm-password`}
											name="confirmPassword"
											type="password"
											autoComplete="new-password"
											required
											value={confirmPassword}
											onChange={(event) => {
												setConfirmPassword(event.target.value);
												clearFieldError("confirmPassword");
											}}
											placeholder="Re-enter your password"
											className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-slate-950 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#2f57db] focus:ring-4 focus:ring-[#2f57db]/10"
										/>
									</div>
								) : null}

								{oauthError ? (
									<p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
										{oauthError}
									</p>
								) : null}

								<button
									type="submit"
									disabled={mutation.isPending}
									className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1e43bf] px-5 font-semibold text-white transition-colors hover:bg-[#1a39a8] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{mutation.isPending ? "Please wait..." : copy.submitLabel}
								</button>

								{formError ? (
									<p className="text-red-600 text-sm">{formError}</p>
								) : null}

								{submitError ? (
									<p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
										{submitError}
									</p>
								) : null}

								<div className="flex items-center gap-3 text-slate-400 text-xs">
									<span className="h-px flex-1 bg-slate-200" />
									<span className="font-medium uppercase tracking-[0.22em]">
										or
									</span>
									<span className="h-px flex-1 bg-slate-200" />
								</div>

								<button
									type="button"
									disabled={googleMutation.isPending}
									onClick={handleGoogleSignIn}
									className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50"
								>
									<GoogleMark />
									{googleMutation.isPending
										? "Please wait..."
										: "Continue with Google"}
								</button>
							</form>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
