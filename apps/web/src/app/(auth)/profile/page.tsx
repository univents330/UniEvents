"use client";

import Image from "next/image";
import { useCurrentUser } from "@/features/auth";
import { PageHeader } from "@/shared/ui/page-header";

export default function ProfilePage() {
	const { data: user, isLoading } = useCurrentUser();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		return <div>Please log in to view your profile.</div>;
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<PageHeader
				title="My Profile"
				description="Manage your account information and preferences"
			/>

			<div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:space-y-6 sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					{user.image ? (
						<Image
							src={user.image}
							alt={user.name || "Profile"}
							width={64}
							height={64}
							className="h-14 w-14 rounded-full border border-slate-200 object-cover sm:h-16 sm:w-16"
						/>
					) : (
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16">
							<span className="font-semibold text-slate-600 text-xl sm:text-2xl">
								{user.name?.charAt(0)?.toUpperCase() ||
									user.email.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
					<div>
						<h2 className="font-semibold text-slate-900 text-xl">
							{user.name || "User"}
						</h2>
						<p className="text-slate-600">{user.email}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<p className="mb-1 block font-medium text-slate-700 text-sm">
							Display Name
						</p>
						<p className="text-slate-900">{user.name || "Not set"}</p>
					</div>
					<div>
						<p className="mb-1 block font-medium text-slate-700 text-sm">
							Email
						</p>
						<p className="text-slate-900">{user.email}</p>
					</div>
					<div>
						<p className="mb-1 block font-medium text-slate-700 text-sm">
							Email Verified
						</p>
						<p className="text-slate-900">
							{user.emailVerified ? "Yes" : "No"}
						</p>
					</div>
					<div>
						<p className="mb-1 block font-medium text-slate-700 text-sm">
							Role
						</p>
						<p className="text-slate-900 capitalize">
							{user.role ? user.role.toLowerCase() : "N/A"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
