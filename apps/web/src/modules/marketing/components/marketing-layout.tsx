"use client";

import {
	Bell,
	ChevronDown,
	Crosshair,
	Heart,
	LogOut,
	MapPin,
	Menu,
	Plus,
	Search,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/cn";
import { useAuth } from "@/core/providers/auth-provider";
import { useUnreadCount } from "@/modules/notifications";
import { Footer } from "./footer";
import { NotificationDrawer } from "./notification-drawer";

const POPULAR_CITIES = ["Kharar", "Chandigarh", "Delhi", "Mumbai", "Bangalore"];

export function MarketingLayout({
	children,
	hideHeader = false,
	hideFooter = false,
}: {
	children: React.ReactNode;
	hideHeader?: boolean;
	hideFooter?: boolean;
}) {
	const { user, isAuthenticated, signOut } = useAuth();
	const unreadQuery = useUnreadCount({ enabled: isAuthenticated });
	const pathname = usePathname();

	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [location, setLocation] = useState("Kharar");
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const profileMenuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 400);
		window.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				locationMenuRef.current &&
				!locationMenuRef.current.contains(event.target as Node)
			) {
				setIsLocationMenuOpen(false);
			}
			if (
				profileMenuRef.current &&
				!profileMenuRef.current.contains(event.target as Node)
			) {
				setIsProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative min-h-screen overflow-x-clip bg-[#fcfdff] font-jakarta">
			{/* High-Impact Global Brand Background - Optimized */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-[-5%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0f3dd9]/10 blur-[80px]" />
				<div className="absolute top-[15%] right-[-15%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[70px]" />
				<div className="absolute bottom-0 left-[-5%] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[60px]" />

				{/* Sharp Grid Pattern Overlay */}
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"linear-gradient(#0f3dd9 1.5px, transparent 1.5px), linear-gradient(90deg, #0f3dd9 1.5px, transparent 1.5px)",
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			{/* Sticky Marketing Header */}
			{!hideHeader && (
				<header
					className={cn(
						"fixed top-0 right-0 left-0 z-50 border-b transition-all duration-500",
						scrolled || isProfileOpen
							? "border-slate-100 bg-white/95 py-4 backdrop-blur-xl"
							: "border-transparent bg-transparent py-6",
						isProfileOpen && "sm:py-4",
					)}
				>
					<div className="container mx-auto px-6">
						<div className="flex items-center justify-between">
							{/* Logo */}
							<Link href="/" className="group flex shrink-0 items-center gap-3">
								<div className="relative h-10 w-10 overflow-hidden transition-transform group-hover:scale-110">
									<Image
										src="/assets/logo_circle_svg.svg"
										alt="UniEvent Logo"
										fill
										className="object-contain"
									/>
								</div>
								<span className="font-black text-2xl text-slate-900 uppercase tracking-tighter">
									UniEvent
								</span>
							</Link>

							{/* Centered Search (Only shows on scroll) */}
							<div
								className={cn(
									"mx-12 hidden max-w-2xl flex-1 items-center transition-all duration-500 lg:flex",
									scrolled
										? "pointer-events-auto translate-y-0 opacity-100"
										: "pointer-events-none translate-y-2 opacity-0",
								)}
							>
								<div className="relative flex h-12 w-full items-center rounded-full border border-slate-200/50 bg-white/50 p-1.5 shadow-sm transition-all focus-within:bg-white">
									<div className="flex flex-1 items-center gap-3 border-slate-100 border-r px-4">
										<Search size={18} className="text-slate-400" />
										<input
											type="text"
											placeholder="Search events..."
											className="w-full border-none bg-transparent font-bold text-slate-900 text-sm outline-none placeholder:text-slate-400"
										/>
									</div>

									<div className="relative" ref={locationMenuRef}>
										<button
											type="button"
											onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
											className="group flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-6 transition-colors hover:bg-slate-50"
										>
											<MapPin size={16} className="text-slate-900" />
											<span className="font-black text-slate-900 text-xs uppercase tracking-widest">
												{location}
											</span>
											<ChevronDown
												size={14}
												className={cn(
													"text-slate-400 transition-transform",
													isLocationMenuOpen && "rotate-180",
												)}
											/>
										</button>

										{isLocationMenuOpen && (
											<div className="fade-in zoom-in-95 absolute top-full right-0 mt-4 w-72 origin-top-right animate-in rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] duration-200">
												<button
													type="button"
													className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-black text-blue-700 transition-colors hover:bg-blue-50"
												>
													<Crosshair className="h-5 w-5" />
													Fetch live location
												</button>
												<div className="mx-2 my-3 border-slate-50 border-t" />
												<div className="space-y-1">
													{POPULAR_CITIES.map((city) => (
														<button
															type="button"
															key={city}
															onClick={() => {
																setLocation(city);
																setIsLocationMenuOpen(false);
															}}
															className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-700"
														>
															<MapPin className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
															{city}
														</button>
													))}
												</div>
											</div>
										)}
									</div>

									<button
										type="button"
										className="flex h-9 w-9 items-center justify-center rounded-full bg-[#000066] text-white shadow-lg transition-all hover:scale-105"
									>
										<Search size={16} />
									</button>
								</div>
							</div>

							{/* Actions */}
							<div className="flex shrink-0 items-center gap-4">
								<nav className="mr-4 hidden items-center gap-8 lg:flex">
									<Link
										href="/events"
										className="font-black text-slate-900 text-sm uppercase tracking-widest transition-colors hover:text-blue-600"
									>
										Discover
									</Link>
								</nav>

								{isAuthenticated ? (
									<div className="flex items-center gap-4">
										<Link
											href="/dashboard/events/create"
											className="!text-[#000066] hidden h-11 items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-6 font-black text-xs uppercase tracking-widest shadow-sm transition-all hover:bg-blue-100 active:scale-95 md:flex"
										>
											Create Event <Plus size={16} />
										</Link>

										<button
											type="button"
											className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-red-100 hover:text-red-500 md:flex"
										>
											<Heart size={18} />
										</button>

										<button
											type="button"
											onClick={() => setNotificationsOpen(true)}
											className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-100 hover:text-blue-600 md:flex"
										>
											<Bell size={18} />
											{(unreadQuery.data?.count ?? 0) > 0 && (
												<span className="absolute top-0 right-0 flex h-4 w-4 translate-x-1 -translate-y-1 items-center justify-center rounded-full border-2 border-white bg-blue-600 font-black text-[10px] text-white">
													{unreadQuery.data?.count}
												</span>
											)}
										</button>

										{/* Unified User & Nav Dropdown (Desktop Hover / Mobile Click) */}
										<div className="relative" ref={profileMenuRef}>
											<button
												type="button"
												onClick={() => setIsProfileOpen(!isProfileOpen)}
												className="group flex cursor-pointer items-center gap-2 pl-2"
											>
												<div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-blue-50 font-black text-[#000066] text-sm shadow-sm transition-transform group-hover:scale-105">
													{user?.name?.[0] ?? "U"}
												</div>
												<ChevronDown
													size={16}
													className={cn(
														"text-slate-400 transition-transform duration-300",
														isProfileOpen && "rotate-180",
													)}
												/>
											</button>

											{isProfileOpen && (
												<div
													className={cn(
														"slide-in-from-top-4 fade-in z-[101] origin-top animate-in transition-all duration-500 ease-out",
														/* Desktop: Concise Floating Dropdown */
														"sm:fixed-none sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-5 sm:h-auto sm:w-72 sm:overflow-hidden sm:rounded-[24px] sm:border sm:border-slate-100 sm:bg-white sm:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]",
														/* Mobile: Integrated Header Extension */
														"fixed top-[4.5rem] left-0 h-[calc(100vh-4.5rem)] w-full overflow-y-auto bg-white sm:backdrop-blur-none",
													)}
												>
													{/* User Info Header - Extended Content */}
													<div className="border-slate-50/50 border-b px-10 py-10 sm:px-6 sm:py-5">
														<h3 className="font-black text-2xl text-[#0000CC] leading-tight sm:text-[17px]">
															{user?.name ?? "User Account"}
														</h3>
														<p className="mt-1.5 truncate font-bold text-lg text-slate-400 sm:mt-0.5 sm:text-sm">
															{user?.email}
														</p>
														<Link
															href="/dashboard"
															onClick={() => setIsProfileOpen(false)}
															className="mt-4 block font-black text-base text-slate-400 transition-colors hover:text-blue-600 sm:mt-2 sm:text-xs"
														>
															Go to user dashboard
														</Link>
													</div>

													{/* Menu Sections - Extended Layout */}
													<div className="space-y-12 px-6 py-10 sm:space-y-5 sm:px-0 sm:py-3">
														{/* User Dashboard Section */}
														<div className="px-4 sm:px-2">
															<p className="mb-4 px-4 font-black text-slate-300 text-xs uppercase tracking-[0.2em] sm:mb-1.5 sm:text-[10px]">
																User Dashboard
															</p>
															<div className="space-y-2 sm:space-y-0">
																<DropdownItem
																	href="/dashboard"
																	label="Dashboard"
																	onClick={() => setIsProfileOpen(false)}
																/>
																<DropdownItem
																	href="/dashboard/tickets"
																	label="Tickets"
																	onClick={() => setIsProfileOpen(false)}
																/>
																<DropdownItem
																	href="/dashboard/notifications"
																	label="Notifications"
																	onClick={() => setIsProfileOpen(false)}
																/>
															</div>
														</div>

														{/* Discover Section */}
														<div className="px-4 sm:px-2">
															<p className="mb-4 px-4 font-black text-slate-300 text-xs uppercase tracking-[0.2em] sm:mb-1.5 sm:text-[10px]">
																Discover
															</p>
															<div className="space-y-2 sm:space-y-0">
																<DropdownItem
																	href="/events"
																	label="Browse Events"
																	onClick={() => setIsProfileOpen(false)}
																/>
															</div>
														</div>

														{/* Host Control Section */}
														<div className="px-4 sm:px-2">
															<p className="mb-4 px-4 font-black text-slate-300 text-xs uppercase tracking-[0.2em] sm:mb-1.5 sm:text-[10px]">
																Host Control
															</p>
															<div className="space-y-2 sm:space-y-0">
																<DropdownItem
																	href="/dashboard/events"
																	label="Manage Events"
																	onClick={() => setIsProfileOpen(false)}
																/>
																<DropdownItem
																	href="/dashboard/orders"
																	label="Orders"
																	onClick={() => setIsProfileOpen(false)}
																/>
															</div>
														</div>
													</div>

													{/* Footer Logout - Integrated Extension */}
													<div className="mt-auto border-slate-50 border-t px-10 pb-20 sm:px-2 sm:pt-1 sm:pb-2">
														<button
															type="button"
															onClick={() => {
																signOut();
																setIsProfileOpen(false);
															}}
															className="group flex w-full items-center gap-5 rounded-3xl px-8 py-6 font-black text-[#FF0033] text-lg shadow-sm transition-all hover:bg-red-50 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm sm:shadow-none"
														>
															<LogOut
																size={24}
																className="text-[#FF0033]/60 group-hover:text-[#FF0033] sm:h-[18px] sm:w-[18px]"
															/>
															Logout
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<Link
											href={`/auth/sign-in?redirect=${encodeURIComponent(pathname || "/")}`}
											className="px-4 font-black text-slate-900 text-sm uppercase tracking-widest transition-colors hover:text-blue-600"
										>
											Login
										</Link>
										<Link
											href={`/auth/sign-up?redirect=${encodeURIComponent(pathname || "/")}`}
											className="flex h-11 items-center rounded-full bg-[#000066] px-8 font-bold text-white! text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 hover:bg-[#000044] active:scale-95"
										>
											Join Now
										</Link>

										<button
											type="button"
											onClick={() => setMobileOpen(!mobileOpen)}
											className="p-2 text-slate-900 lg:hidden"
										>
											{mobileOpen ? <X size={24} /> : <Menu size={24} />}
										</button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Mobile Nav */}
					{mobileOpen && (
						<div className="slide-in-from-top animate-in space-y-6 border-slate-100 border-t bg-white p-6 duration-300 lg:hidden">
							<nav className="flex flex-col gap-6">
								<Link
									href="/events"
									className="font-black text-2xl text-slate-900"
								>
									Discover
								</Link>
								<Link
									href="/auth/sign-in"
									className="font-black text-2xl text-slate-900"
								>
									Login
								</Link>
								<Link
									href="/auth/sign-up"
									className="font-black text-2xl text-slate-600"
								>
									Join Now
								</Link>
							</nav>
						</div>
					)}
				</header>
			)}

			{/* Main Content Area */}
			<main className="relative z-10 w-full">{children}</main>

			{!hideFooter && <Footer />}

			<NotificationDrawer
				isOpen={notificationsOpen}
				onClose={() => setNotificationsOpen(false)}
			/>
		</div>
	);
}

function DropdownItem({
	href,
	label,
	onClick,
}: {
	href: string;
	label: string;
	onClick?: () => void;
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className="group flex items-center gap-5 rounded-3xl px-8 py-5 font-bold text-lg text-slate-700 transition-all hover:bg-slate-50 hover:text-[#0000CC] sm:gap-3.5 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
		>
			<User
				size={22}
				className="text-slate-300 transition-colors group-hover:text-blue-400 sm:h-[18px] sm:w-[18px]"
			/>
			{label}
		</Link>
	);
}
