"use client";

import Image from "next/image";
import { useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { useAuth } from "@/core/providers/auth-provider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SectionTitle } from "@/shared/ui/section-title";
import { Switch } from "@/shared/ui/switch";
import { useMe, useSetHostMode, useUpdateMe } from "../hooks/use-users";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function ProfileView() {
	const { user: sessionUser, signOut, refresh } = useAuth();
	const meQuery = useMe();
	const updateMe = useUpdateMe();
	const setHostMode = useSetHostMode();
	const profile = meQuery.data;

	const [name, setName] = useState("");
	const [skills, setSkills] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState("");
	const [hostModeError, setHostModeError] = useState("");

	function startEdit() {
		if (!profile) return;
		setName(profile.name ?? "");
		setSkills((profile.skills ?? []).join(", "));
		setIsEditing(true);
		setError("");
	}

	async function handleSave(event: React.FormEvent) {
		event.preventDefault();
		setError("");

		try {
			const parsedSkills = skills
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s.length > 0);

			await updateMe.mutateAsync({
				name: name.trim() || null,
				skills: parsedSkills,
			});
			setIsEditing(false);
		} catch (err) {
			setError(getApiErrorMessage(err, "Unable to update profile."));
		}
	}

	async function handleHostModeChange(enabled: boolean) {
		setHostModeError("");

		try {
			await setHostMode.mutateAsync(enabled);
			await refresh();
		} catch (err) {
			setHostModeError(getApiErrorMessage(err, "Unable to update host mode."));
		}
	}

	if (!sessionUser) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				You need to sign in to view your profile.
			</div>
		);
	}

	if (meQuery.isLoading) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">Loading profile...</div>
		);
	}

	if (meQuery.isError || !profile) {
		return (
			<div className="panel-soft p-6 text-[#5f6984]">
				Unable to load profile right now.
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<SectionTitle
					eyebrow="Profile"
					title={profile.name ?? "Your account"}
					description="Manage your profile information and account settings."
				/>
				<Button variant="ghost" onClick={signOut}>
					Sign out
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="panel space-y-6 p-6 md:p-8">
					{isEditing ? (
						<form onSubmit={handleSave} className="space-y-5">
							{error && (
								<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-[#c53030] text-sm">
									{error}
								</div>
							)}

							<label htmlFor="profile-name" className="block space-y-2">
								<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
									Name
								</span>
								<Input
									id="profile-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Your name"
								/>
							</label>

							<label htmlFor="profile-skills" className="block space-y-2">
								<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
									Skills (comma-separated)
								</span>
								<Input
									id="profile-skills"
									value={skills}
									onChange={(e) => setSkills(e.target.value)}
									placeholder="React, TypeScript, Design"
								/>
							</label>

							<div className="flex gap-3">
								<Button type="submit" disabled={updateMe.isPending}>
									{updateMe.isPending ? "Saving..." : "Save changes"}
								</Button>
								<Button
									type="button"
									variant="ghost"
									onClick={() => setIsEditing(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					) : (
						<div className="space-y-5">
							<div className="flex items-center gap-4">
								{profile.image ? (
									<Image
										width={64}
										height={64}
										src={profile.image}
										alt={profile.name ?? "Avatar"}
										className="h-16 w-16 rounded-full border-2 border-[#d6def4] object-cover"
									/>
								) : (
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1264db] to-[#0e43b9] font-bold text-2xl text-white">
										{(profile.name ?? profile.email)[0]?.toUpperCase()}
									</div>
								)}
								<div>
									<h3 className="display-font font-bold text-[#0e1838] text-xl">
										{profile.name ?? "Unnamed user"}
									</h3>
									<p className="text-[#5f6984] text-sm">{profile.email}</p>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<InfoBlock label="Role" value={profile.role} />
								<InfoBlock
									label="Verified"
									value={profile.emailVerified ? "Yes" : "No"}
								/>
								<InfoBlock
									label="Joined"
									value={formatDate(profile.createdAt)}
								/>
								<InfoBlock
									label="Updated"
									value={formatDate(profile.updatedAt)}
								/>
							</div>

							{profile.skills.length > 0 && (
								<div className="space-y-2">
									<p className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
										Skills
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.skills.map((skill) => (
											<Badge key={skill}>{skill}</Badge>
										))}
									</div>
								</div>
							)}

							<Button onClick={startEdit}>Edit profile</Button>
						</div>
					)}
				</div>

				<div className="panel-soft space-y-4 p-6 md:p-8">
					<h3 className="display-font font-bold text-[#112152] text-lg">
						Account details
					</h3>
					{hostModeError && (
						<div className="rounded-xl border border-[#fecaca] bg-[#fff5f5] px-4 py-3 text-[#c53030] text-sm">
							{hostModeError}
						</div>
					)}
					<div className="space-y-3 text-sm">
						<div className="flex items-center justify-between rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
							<span className="text-[#5f6984]">Email</span>
							<span className="font-semibold text-[#1e2a4d]">
								{profile.email}
							</span>
						</div>
						<div className="flex items-center justify-between rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
							<span className="text-[#5f6984]">Role</span>
							<Badge
								variant={
									profile.role === "ADMIN"
										? "destructive"
										: profile.role === "HOST"
											? "warning"
											: "default"
								}
							>
								{profile.role}
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-xl border border-[#d7e0f8] bg-white px-4 py-3">
							<span className="text-[#5f6984]">Email verified</span>
							<Badge variant={profile.emailVerified ? "success" : "warning"}>
								{profile.emailVerified ? "Verified" : "Pending"}
							</Badge>
						</div>
					</div>

					{profile.role !== "ADMIN" ? (
						<Switch
							checked={profile.role === "HOST"}
							onCheckedChange={handleHostModeChange}
							disabled={setHostMode.isPending}
							label="Host mode"
							description="Turn this on to access host tools and event management."
						/>
					) : (
						<div className="rounded-xl border border-[#d7e0f8] bg-white px-4 py-3 text-[#5f6984] text-sm">
							Admin accounts always have host access.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl border border-[#d9e2f8] bg-white p-4">
			<p className="font-semibold text-[#6e7999] text-xs uppercase tracking-wide">
				{label}
			</p>
			<p className="mt-2 font-semibold text-[#1e2a4d] text-sm">{value}</p>
		</div>
	);
}
