"use client";

import {
	Check,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	LogOut,
	Mail,
	Monitor,
	Pencil,
	Shield,
	Smartphone,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	authService,
	useChangePassword,
	useCurrentUser,
	useUpdateProfile,
} from "@/features/auth";
import { showNotification } from "@/shared/lib/notifications";

/* ------------------------------------------------------------------ */
/*  Profile Page                                                       */
/* ------------------------------------------------------------------ */

export default function UserProfilePage() {
	const { data: user, isLoading } = useCurrentUser();

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (!user) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="rounded-2xl border border-[#dbe7ff] bg-white p-10 text-center shadow-sm">
					<User className="mx-auto mb-4 h-12 w-12 text-slate-300" />
					<h2 className="font-semibold text-lg text-slate-800">
						Not logged in
					</h2>
					<p className="mt-1 text-slate-500">
						Please log in to view your profile.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			{/* Page Header */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<h1 className="font-bold text-2xl text-[#071a78]">My Profile</h1>
				<p className="mt-1 text-slate-600">
					Manage your profile information and preferences.
				</p>
			</div>

			{/* Profile Card */}
			<ProfileCard user={user} />

			{/* Personal Info */}
			<PersonalInfoCard user={user} />

			{/* Change Password */}
			<ChangePasswordCard />

			{/* Active Sessions */}
			<ActiveSessionsCard />
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Profile Card (Avatar + Name + Role)                                */
/* ------------------------------------------------------------------ */

function ProfileCard({
	user,
}: {
	user: {
		id: string;
		name: string | null;
		email: string;
		emailVerified: boolean;
		image: string | null;
		role: string;
		createdAt: Date;
	};
}) {
	const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="relative overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white shadow-sm">
			{/* Gradient banner */}
			<div className="h-32 bg-gradient-to-r from-[#071a78] via-[#1e3faa] to-[#4f6fdb]" />

			<div className="relative px-6 pb-6">
				{/* Avatar — centered overlap */}
				<div className="-mt-12 mb-4 flex flex-col items-center text-center">
					{user.image ? (
						<Image
							src={user.image}
							alt={user.name || "Avatar"}
							width={96}
							height={96}
							className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
						/>
					) : (
						<div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#071a78] to-[#4f6fdb] shadow-lg">
							<span className="font-bold text-3xl text-white">
								{user.name?.charAt(0)?.toUpperCase() ||
									user.email.charAt(0).toUpperCase()}
							</span>
						</div>
					)}

					{/* Name + Badge */}
					<div className="mt-3 flex items-center gap-2">
						<h2 className="font-bold text-slate-900 text-xl">
							{user.name || "User"}
						</h2>
						<Badge
							variant="secondary"
							className="shrink-0 border-0 bg-[#eef3ff] text-[#071a78] capitalize"
						>
							{user.role?.toLowerCase() || "user"}
						</Badge>
					</div>
					<p className="mt-0.5 text-slate-500 text-sm">{user.email}</p>
				</div>

				{/* Stats row */}
				<div className="flex items-center divide-x divide-[#dbe7ff] rounded-xl bg-[#f7faff] py-4">
					<div className="flex-1 text-center">
						<p className="font-semibold text-[#071a78] text-xs uppercase tracking-wide">
							Member since
						</p>
						<p className="mt-1 text-slate-700 text-sm">{joinedDate}</p>
					</div>
					<div className="flex-1 text-center">
						<p className="font-semibold text-[#071a78] text-xs uppercase tracking-wide">
							Email
						</p>
						<div className="mt-1 flex items-center justify-center gap-1">
							{user.emailVerified ? (
								<>
									<Check className="h-3.5 w-3.5 text-emerald-500" />
									<span className="text-emerald-600 text-sm">Verified</span>
								</>
							) : (
								<>
									<X className="h-3.5 w-3.5 text-amber-500" />
									<span className="text-amber-600 text-sm">Unverified</span>
								</>
							)}
						</div>
					</div>
					<div className="flex-1 text-center">
						<p className="font-semibold text-[#071a78] text-xs uppercase tracking-wide">
							Role
						</p>
						<p className="mt-1 text-slate-700 text-sm capitalize">
							{user.role?.toLowerCase() || "N/A"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Personal Info (Editable)                                           */
/* ------------------------------------------------------------------ */

function PersonalInfoCard({
	user,
}: {
	user: {
		name: string | null;
		email: string;
	};
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(user.name || "");
	const updateProfile = useUpdateProfile();

	// Sync when user data changes externally
	useEffect(() => {
		setName(user.name || "");
	}, [user.name]);

	const handleSave = async () => {
		if (!name.trim()) {
			showNotification({
				title: "Validation error",
				message: "Name cannot be empty.",
				color: "red",
			});
			return;
		}

		await updateProfile.mutateAsync({ name: name.trim() });
		setIsEditing(false);
	};

	const handleCancel = () => {
		setName(user.name || "");
		setIsEditing(false);
	};

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<User className="h-5 w-5 text-[#071a78]" />
					<h3 className="font-semibold text-[#071a78] text-lg">
						Personal Information
					</h3>
				</div>
				{!isEditing ? (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsEditing(true)}
						className="gap-1.5 rounded-lg border-[#dbe7ff] text-[#071a78] hover:bg-[#f0f4ff]"
					>
						<Pencil className="h-3.5 w-3.5" />
						Edit
					</Button>
				) : (
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleCancel}
							disabled={updateProfile.isPending}
							className="rounded-lg border-slate-200"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleSave}
							disabled={updateProfile.isPending}
							className="rounded-lg bg-[#071a78] text-white hover:bg-[#0a24a0]"
						>
							{updateProfile.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Check className="h-4 w-4" />
							)}
							Save
						</Button>
					</div>
				)}
			</div>

			<div className="space-y-4">
				{/* Name field */}
				<div>
					<label
						htmlFor="profile-name"
						className="mb-1.5 block font-medium text-slate-700 text-sm"
					>
						Display Name
					</label>
					{isEditing ? (
						<Input
							id="profile-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="rounded-lg border-[#dbe7ff] focus-visible:ring-[#071a78]"
							maxLength={100}
						/>
					) : (
						<p className="rounded-lg bg-[#f7faff] px-3 py-2.5 text-slate-800">
							{user.name || "Not set"}
						</p>
					)}
				</div>

				{/* Email field (read-only) */}
				<div>
					<label
						htmlFor="profile-email"
						className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-700 text-sm"
					>
						<Mail className="h-3.5 w-3.5" />
						Email Address
					</label>
					<div className="flex items-center gap-2">
						<p className="flex-1 rounded-lg bg-[#f7faff] px-3 py-2.5 text-slate-800">
							{user.email}
						</p>
						<Badge
							variant="outline"
							className="shrink-0 border-slate-200 text-slate-500"
						>
							Read-only
						</Badge>
					</div>
					<p className="mt-1 text-slate-400 text-xs">
						Email cannot be changed for security reasons.
					</p>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Change Password                                                    */
/* ------------------------------------------------------------------ */

function ChangePasswordCard() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const changePassword = useChangePassword();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword.length < 8) {
			showNotification({
				title: "Password too short",
				message: "New password must be at least 8 characters long.",
				color: "red",
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			showNotification({
				title: "Passwords don't match",
				message: "Please make sure both passwords match.",
				color: "red",
			});
			return;
		}

		await changePassword.mutateAsync({
			oldPassword: currentPassword,
			newPassword,
		});

		// Reset form
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setIsOpen(false);
	};

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<KeyRound className="h-5 w-5 text-[#071a78]" />
					<h3 className="font-semibold text-[#071a78] text-lg">
						Password & Security
					</h3>
				</div>
				{!isOpen && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsOpen(true)}
						className="gap-1.5 rounded-lg border-[#dbe7ff] text-[#071a78] hover:bg-[#f0f4ff]"
					>
						<KeyRound className="h-3.5 w-3.5" />
						Change Password
					</Button>
				)}
			</div>

			{!isOpen ? (
				<p className="mt-2 text-slate-500 text-sm">
					It&apos;s recommended to change your password regularly to keep your
					account secure.
				</p>
			) : (
				<form onSubmit={handleSubmit} className="mt-5 space-y-4">
					{/* Current Password */}
					<div>
						<label
							htmlFor="current-password"
							className="mb-1.5 block font-medium text-slate-700 text-sm"
						>
							Current Password
						</label>
						<div className="relative">
							<Input
								id="current-password"
								type={showCurrent ? "text" : "password"}
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								placeholder="Enter current password"
								className="rounded-lg border-[#dbe7ff] pr-10 focus-visible:ring-[#071a78]"
								required
								minLength={8}
							/>
							<button
								type="button"
								onClick={() => setShowCurrent(!showCurrent)}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{showCurrent ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{/* New Password */}
					<div>
						<label
							htmlFor="new-password"
							className="mb-1.5 block font-medium text-slate-700 text-sm"
						>
							New Password
						</label>
						<div className="relative">
							<Input
								id="new-password"
								type={showNew ? "text" : "password"}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Enter new password"
								className="rounded-lg border-[#dbe7ff] pr-10 focus-visible:ring-[#071a78]"
								required
								minLength={8}
								maxLength={72}
							/>
							<button
								type="button"
								onClick={() => setShowNew(!showNew)}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{showNew ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{newPassword.length > 0 && newPassword.length < 8 && (
							<p className="mt-1 text-red-500 text-xs">
								Must be at least 8 characters
							</p>
						)}
					</div>

					{/* Confirm Password */}
					<div>
						<label
							htmlFor="confirm-password"
							className="mb-1.5 block font-medium text-slate-700 text-sm"
						>
							Confirm New Password
						</label>
						<div className="relative">
							<Input
								id="confirm-password"
								type={showConfirm ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
								className="rounded-lg border-[#dbe7ff] pr-10 focus-visible:ring-[#071a78]"
								required
								minLength={8}
								maxLength={72}
							/>
							<button
								type="button"
								onClick={() => setShowConfirm(!showConfirm)}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{showConfirm ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{confirmPassword.length > 0 && newPassword !== confirmPassword && (
							<p className="mt-1 text-red-500 text-xs">
								Passwords do not match
							</p>
						)}
					</div>

					{/* Buttons */}
					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								setIsOpen(false);
								setCurrentPassword("");
								setNewPassword("");
								setConfirmPassword("");
							}}
							disabled={changePassword.isPending}
							className="rounded-lg border-slate-200"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={changePassword.isPending}
							className="rounded-lg bg-[#071a78] text-white hover:bg-[#0a24a0]"
						>
							{changePassword.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Shield className="h-4 w-4" />
							)}
							Update Password
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Active Sessions                                                    */
/* ------------------------------------------------------------------ */

interface SessionData {
	id: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
}

function parseDeviceInfo(userAgent: string | null) {
	if (!userAgent) return { device: "Unknown device", icon: Monitor };

	const ua = userAgent.toLowerCase();

	if (
		ua.includes("mobile") ||
		ua.includes("android") ||
		ua.includes("iphone")
	) {
		return { device: "Mobile Device", icon: Smartphone };
	}

	let browser = "Browser";
	if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
	else if (ua.includes("firefox")) browser = "Firefox";
	else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
	else if (ua.includes("edg")) browser = "Edge";

	let os = "";
	if (ua.includes("windows")) os = "Windows";
	else if (ua.includes("mac")) os = "macOS";
	else if (ua.includes("linux")) os = "Linux";

	return {
		device: `${browser}${os ? ` on ${os}` : ""}`,
		icon: Monitor,
	};
}

function ActiveSessionsCard() {
	const [sessions, setSessions] = useState<SessionData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [revokingId, setRevokingId] = useState<string | null>(null);

	const loadSessions = async () => {
		setIsLoading(true);
		try {
			const data = await authService.getSessions();
			setSessions(data as SessionData[]);
		} catch {
			// silently fail — sessions may not be supported
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadSessions();
	}, []);

	const handleRevoke = async (session: SessionData) => {
		setRevokingId(session.id);
		try {
			await authService.revokeSession(session.token);
			showNotification({
				title: "Session revoked",
				message: "The session has been terminated.",
				color: "green",
			});
			await loadSessions();
		} catch {
			showNotification({
				title: "Error",
				message: "Failed to revoke session.",
				color: "red",
			});
		} finally {
			setRevokingId(null);
		}
	};

	return (
		<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6 shadow-sm">
			<div className="flex items-center gap-2">
				<Monitor className="h-5 w-5 text-[#071a78]" />
				<h3 className="font-semibold text-[#071a78] text-lg">
					Active Sessions
				</h3>
			</div>
			<p className="mt-1 mb-5 text-slate-500 text-sm">
				Manage your active login sessions. Revoke any session you don&apos;t
				recognize.
			</p>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="flex items-center gap-4 rounded-xl bg-[#f7faff] p-4"
						>
							<Skeleton className="h-10 w-10 rounded-lg" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-28" />
							</div>
						</div>
					))}
				</div>
			) : sessions.length === 0 ? (
				<div className="rounded-xl bg-[#f7faff] p-6 text-center">
					<Monitor className="mx-auto mb-2 h-8 w-8 text-slate-300" />
					<p className="text-slate-500 text-sm">No active sessions found.</p>
				</div>
			) : (
				<div className="space-y-3">
					{sessions.map((session, index) => {
						const { device, icon: DeviceIcon } = parseDeviceInfo(
							session.userAgent,
						);
						const isFirst = index === 0;
						const createdAt = new Date(session.createdAt).toLocaleDateString(
							"en-US",
							{
								month: "short",
								day: "numeric",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							},
						);

						return (
							<div
								key={session.id}
								className={`flex items-center gap-4 rounded-xl p-4 transition-colors ${
									isFirst
										? "border border-emerald-200 bg-emerald-50/50"
										: "bg-[#f7faff]"
								}`}
							>
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-lg ${
										isFirst
											? "bg-emerald-100 text-emerald-600"
											: "bg-[#eef3ff] text-[#071a78]"
									}`}
								>
									<DeviceIcon className="h-5 w-5" />
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="truncate font-medium text-slate-800 text-sm">
											{device}
										</p>
										{isFirst && (
											<Badge className="border-0 bg-emerald-100 text-[10px] text-emerald-700">
												Current
											</Badge>
										)}
									</div>
									<p className="text-slate-400 text-xs">
										{session.ipAddress || "Unknown IP"} · {createdAt}
									</p>
								</div>

								{!isFirst && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleRevoke(session)}
										disabled={revokingId === session.id}
										className="shrink-0 gap-1 text-red-500 hover:bg-red-50 hover:text-red-600"
									>
										{revokingId === session.id ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<LogOut className="h-3.5 w-3.5" />
										)}
										Revoke
									</Button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function ProfileSkeleton() {
	return (
		<div className="mx-auto max-w-3xl space-y-6">
			{/* Header skeleton */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<Skeleton className="h-8 w-36" />
				<Skeleton className="mt-2 h-4 w-72" />
			</div>

			{/* Profile card skeleton */}
			<div className="overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white">
				<Skeleton className="h-28 w-full rounded-none" />
				<div className="px-6 pb-6">
					<div className="-mt-14 flex items-end gap-5">
						<Skeleton className="h-24 w-24 rounded-2xl border-4 border-white" />
						<div className="mb-1 flex-1 space-y-2">
							<Skeleton className="h-6 w-44" />
							<Skeleton className="h-4 w-56" />
						</div>
					</div>
					<div className="mt-4 grid grid-cols-3 gap-4 rounded-xl bg-[#f7faff] p-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex flex-col items-center gap-1.5">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-3 w-16" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Info skeleton */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<Skeleton className="h-6 w-48" />
				<div className="mt-5 space-y-4">
					<div>
						<Skeleton className="mb-1.5 h-4 w-24" />
						<Skeleton className="h-10 w-full rounded-lg" />
					</div>
					<div>
						<Skeleton className="mb-1.5 h-4 w-28" />
						<Skeleton className="h-10 w-full rounded-lg" />
					</div>
				</div>
			</div>

			{/* Password skeleton */}
			<div className="rounded-2xl border border-[#dbe7ff] bg-white p-6">
				<Skeleton className="h-6 w-44" />
				<Skeleton className="mt-2 h-4 w-80" />
			</div>
		</div>
	);
}
