"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, Calendar, Check, Heart, Ticket, Trash2, X } from "lucide-react";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import {
	type NotificationRecord,
	useDeleteNotification,
	useMarkAllAsRead,
	useNotifications,
} from "../../../modules/notifications";

dayjs.extend(relativeTime);

interface NotificationDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function NotificationDrawer({
	isOpen,
	onClose,
}: NotificationDrawerProps) {
	const { user } = useAuth();
	const { data: notificationsResponse, isLoading } = useNotifications(
		{},
		{ enabled: Boolean(user) },
	);
	const markAllAsRead = useMarkAllAsRead();
	const deleteNotification = useDeleteNotification();

	// We don't return null anymore to allow for exit animations
	const notifications = notificationsResponse?.data ?? [];

	const handleDelete = (id: string) => {
		deleteNotification.mutate(id);
	};

	const handleMarkAllRead = () => {
		if (user?.id) {
			markAllAsRead.mutate(user.id);
		}
	};

	return (
		<>
			{/* Subtle Backdrop - Transitioning opacity */}
			<button
				type="button"
				className={cn(
					"pointer-events-none fixed inset-0 z-[100] bg-slate-900/5 transition-opacity duration-700 ease-in-out",
					isOpen && "pointer-events-auto opacity-100",
				)}
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Escape") onClose();
				}}
				aria-label="Close notifications"
			/>

			{/* Side Drawer "Experience" - Glassmorphic & Integrated */}
			<div
				className={cn(
					"cubic-bezier(0.4, 0, 0.2, 1) fixed top-20 right-0 z-[101] h-[calc(100vh-5rem)] w-full max-w-[420px] border-white/20 border-l bg-white/80 shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-700",
					isOpen ? "translate-x-0" : "translate-x-full",
				)}
			>
				<div className="flex h-full flex-col">
					{/* Header - Matching Screenshot Style */}
					<div className="relative p-10 pb-6">
						<button
							type="button"
							onClick={onClose}
							className="absolute top-10 right-10 text-slate-300 transition-all duration-300 hover:rotate-90 hover:text-slate-900"
						>
							<X size={24} />
						</button>

						<h2 className="font-black text-[#000031] text-[34px] leading-none tracking-tight">
							Notifications
						</h2>
						<p className="mt-3 font-bold text-slate-500 text-sm">
							Stay up to date on important information
						</p>

						{/* Action Buttons */}
						<div className="mt-8 flex items-center gap-3">
							<button
								type="button"
								onClick={handleMarkAllRead}
								className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 font-black text-[11px] text-slate-600 uppercase tracking-wider transition-all hover:bg-slate-50 active:scale-95"
							>
								<Check size={14} className="text-slate-400" />
								Mark all read
							</button>
							<button
								type="button"
								className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 font-black text-[11px] text-slate-600 uppercase tracking-wider transition-all hover:bg-slate-50 active:scale-95"
							>
								<Trash2 size={14} className="text-slate-400" />
								Clear all
							</button>
						</div>
					</div>

					{/* Notifications List */}
					<div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-10 py-4">
						{isLoading ? (
							<div className="flex h-full flex-col items-center justify-center opacity-30">
								<div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#000031]" />
							</div>
						) : notifications.length === 0 ? (
							<div className="fade-in zoom-in-95 flex h-full animate-in flex-col items-center justify-center py-20 text-center duration-1000">
								<div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-blue-600">
									<div className="absolute inset-0 animate-pulse rounded-full bg-blue-50 opacity-50 blur-2xl" />
									<Bell
										size={36}
										strokeWidth={1.5}
										className="relative z-10 opacity-40"
									/>
								</div>
								<h3 className="font-black text-[#000031] text-[24px]">
									Nothing to see here (yet)!
								</h3>
								<p className="mx-auto mt-3 max-w-[260px] font-bold text-slate-500 text-sm leading-relaxed">
									We'll be sure to let you know when we have something for you
								</p>
							</div>
						) : (
							<div className="space-y-5">
								{notifications.map((notification: NotificationRecord) => {
									const isUnread = notification.status === "UNREAD";
									return (
										<div
											key={notification.id}
											className={cn(
												"group relative flex items-start gap-5 rounded-[36px] p-6 transition-all duration-500",
												!isUnread
													? "border border-slate-50 bg-white hover:bg-slate-50/50"
													: "border border-blue-50 bg-blue-50/40 shadow-sm",
											)}
										>
											<div
												className={cn(
													"flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] shadow-sm transition-transform duration-500 group-hover:scale-110",
													notification.type === "ticket"
														? "bg-indigo-50 text-indigo-600"
														: notification.type === "favorite"
															? "bg-red-50 text-red-600"
															: "bg-blue-50 text-blue-600",
												)}
											>
												{notification.type === "ticket" ? (
													<Ticket size={24} />
												) : notification.type === "favorite" ? (
													<Heart size={24} />
												) : (
													<Calendar size={24} />
												)}
											</div>

											<div className="min-w-0 flex-1">
												<h4 className="font-bold text-[15px] text-slate-900 leading-snug">
													{notification.title}
												</h4>
												<p className="mt-1.5 text-slate-500 text-xs leading-relaxed">
													{notification.message}
												</p>
												<span className="mt-3 block font-black text-[10px] text-slate-400 uppercase tracking-[0.1em]">
													{dayjs(notification.createdAt).fromNow()}
												</span>
											</div>

											<button
												type="button"
												onClick={() => handleDelete(notification.id)}
												className="transform p-2 text-slate-300 opacity-0 transition-all duration-300 hover:rotate-12 hover:text-red-500 group-hover:opacity-100"
											>
												<Trash2 size={16} />
											</button>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
