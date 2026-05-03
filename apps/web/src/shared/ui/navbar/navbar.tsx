"use client";

import {
	Bell,
	ChevronDown,
	Heart,
	LocateFixed,
	LogOut,
	MapPin,
	Search,
	UserCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { NotificationDrawer } from "@/modules/marketing/components/notification-drawer";
import {
	useMarkAllAsRead,
	useNotifications,
	useUnreadCount,
} from "@/modules/notifications/hooks/use-notifications";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

function getProfileInitial(
	name: string | null | undefined,
	email: string | null | undefined,
) {
	const base = name?.trim() || email?.trim() || "U";
	return base.charAt(0).toUpperCase();
}

interface NavbarProps {
	minimal?: boolean;
}

export function Navbar({ minimal = false }: NavbarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isAuthenticated, signOut } = useAuth();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [showScrolledSearch, setShowScrolledSearch] = useState(false);
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [location, setLocation] = useState("Chandigarh");
	const [isLocating, setIsLocating] = useState(false);
	const profileMenuRef = useRef<HTMLDivElement | null>(null);
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const profileCloseTimerRef = useRef<number | null>(null);
	const notificationsPanelRef = useRef<HTMLElement | null>(null);

	const { data: _notifications } = useNotifications({ limit: 10 });
	const { data: unreadCount } = useUnreadCount({ enabled: isAuthenticated });
	const markAllAsReadMutation = useMarkAllAsRead();

	const locationOptions = useMemo(() => {
		const defaults = ["Chandigarh", "Delhi", "Mumbai", "Bangalore"];

		if (
			location &&
			!defaults.some((item) => item.toLowerCase() === location.toLowerCase())
		) {
			return [location, ...defaults];
		}

		return defaults;
	}, [location]);

	const closeLocationMenu = () => {
		setIsLocationMenuOpen(false);
	};

	useEffect(() => {
		const handleScroll = () => {
			const heroThreshold = Math.max(window.innerHeight - 120, 220);
			setShowScrolledSearch(window.scrollY > heroThreshold);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, []);

	useEffect(() => {
		return () => {
			if (profileCloseTimerRef.current) {
				window.clearTimeout(profileCloseTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			const isInsideDesktopMenu = profileMenuRef.current?.contains(target);
			const isInsideLocationMenu = locationMenuRef.current?.contains(target);

			if (!isInsideDesktopMenu) {
				setIsProfileMenuOpen(false);
			}

			if (!isInsideLocationMenu) {
				setIsLocationMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	useEffect(() => {
		if (!isNotificationsOpen) {
			return;
		}

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			const isInsidePanel = notificationsPanelRef.current?.contains(target);

			if (!isInsidePanel) {
				setIsNotificationsOpen(false);
			}
		};

		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsNotificationsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [isNotificationsOpen]);

	const handleSearch = () => {
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("search", searchQuery);
		}

		if (location) {
			params.set("location", location);
		}

		router.push(`/events?${params.toString()}`);
		closeLocationMenu();
	};

	const handleUseLiveLocation = async () => {
		setIsLocating(true);
		setTimeout(() => {
			setLocation("Chandigarh");
			setIsLocating(false);
			closeLocationMenu();
		}, 1000);
	};

	const handleBrowseOnlineEvents = () => {
		setLocation("Online");
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("search", searchQuery);
		}

		params.set("location", "online");
		params.set("mode", "ONLINE");
		router.push(`/events?${params.toString()}`);
		closeLocationMenu();
	};

	const handlePickLocation = (value: string) => {
		setLocation(value);
		closeLocationMenu();
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const openProfileMenu = () => {
		if (profileCloseTimerRef.current) {
			window.clearTimeout(profileCloseTimerRef.current);
			profileCloseTimerRef.current = null;
		}
		setIsProfileMenuOpen(true);
	};

	const closeProfileMenuWithSlide = () => {
		if (profileCloseTimerRef.current) {
			window.clearTimeout(profileCloseTimerRef.current);
		}

		profileCloseTimerRef.current = window.setTimeout(() => {
			setIsProfileMenuOpen(false);
			profileCloseTimerRef.current = null;
		}, 120);
	};

	const handleNavigateFromProfileMenu = (href: string) => {
		router.push(href);
		setIsProfileMenuOpen(false);
		setIsMobileMenuOpen(false);
	};

	const handleLogout = async () => {
		setIsProfileMenuOpen(false);
		setIsMobileMenuOpen(false);
		await signOut();
	};

	const handleOpenNotifications = () => {
		setIsNotificationsOpen(true);
		if (user?.id && unreadCount?.count && unreadCount.count > 0) {
			markAllAsReadMutation.mutate(user.id);
		}
	};

	const handleNavigateToLikedEvents = () => {
		router.push("/liked-events");
	};

	interface MenuSection {
		section?: string;
		items: Array<{ label: string; href: string }>;
	}

	const isManagementRoute =
		pathname.startsWith("/dashboard/events") ||
		pathname.startsWith("/dashboard/admin");
	const isUserRoute = pathname.startsWith("/dashboard");
	const userRole = user?.role;

	const profileMenuItems = useMemo(() => {
		const sections: MenuSection[] = [
			{
				section: "User Dashboard",
				items: [
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Tickets", href: "/dashboard/tickets" },
					{ label: "Liked", href: "/liked-events" },
					{ label: "Settings", href: "/dashboard/profile" },
				],
			},
			...(minimal || isManagementRoute
				? []
				: [
						{
							section: "Discover",
							items: [{ label: "Browse Events", href: "/events" }],
						},
					]),
		];

		return sections;
	}, [minimal, isManagementRoute]);

	const profileInitial = getProfileInitial(user?.name, user?.email);
	const alwaysShowSearch = pathname !== "/";
	const isSearchVisible =
		!minimal && !isManagementRoute && (alwaysShowSearch || showScrolledSearch);

	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-slate-100 border-b bg-white">
			<div
				className={
					minimal
						? "flex h-16 w-full items-center justify-between px-6 lg:px-8"
						: isUserRoute
							? "flex h-16 w-full items-center justify-between gap-6 px-6 lg:gap-8"
							: "mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:gap-8"
				}
			>
				<div className="flex items-center">
					<Link href="/" className="flex shrink-0 items-center gap-2">
						<Image
							src="/assets/logo.webp"
							alt="UniEvent logo"
							width={50}
							height={40}
							priority
							style={{ width: "auto", height: "auto" }}
						/>
						<span className="hidden font-black text-2xl text-[#070190] leading-none tracking-tight md:inline md:text-[29px]">
							UniEvent
						</span>
					</Link>
				</div>

				{!minimal && !isManagementRoute && (
					<div
						className={`hidden flex-1 items-center justify-center transition-all duration-300 lg:flex ${
							isSearchVisible
								? "pointer-events-auto translate-y-0 opacity-100"
								: "pointer-events-none -translate-y-2 opacity-0"
						}`}
					>
						<div className="w-full max-w-2xl rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_8px_30px_rgba(7,1,144,0.08)]">
							<div className="flex items-center gap-2">
								<div className="flex min-w-0 flex-1 items-center gap-2 px-3">
									<Search className="h-4 w-4 shrink-0 text-slate-500" />
									<Input
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyDown={handleSearchKeyDown}
										placeholder="Search events..."
										className="h-auto border-none bg-transparent p-0 font-medium text-[15px] text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
									/>
								</div>

								<div className="h-8 w-px bg-slate-200" />

								<div
									ref={locationMenuRef}
									className="relative hidden items-center gap-2 px-3 md:flex"
								>
									<button
										type="button"
										onClick={() => setIsLocationMenuOpen((prev) => !prev)}
										className="flex items-center gap-2 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-50"
										aria-expanded={isLocationMenuOpen}
										aria-label="Open location menu"
									>
										<MapPin className="h-4 w-4 shrink-0 text-slate-500" />
										<span className="w-24 truncate text-left font-semibold text-[#070190] text-sm">
											{location || "Select location"}
										</span>
										<ChevronDown
											className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
												isLocationMenuOpen ? "rotate-180" : "rotate-0"
											}`}
										/>
									</button>

									<div
										className={`absolute top-full right-0 z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(7,1,144,0.16)] transition-all ${
											isLocationMenuOpen
												? "pointer-events-auto translate-y-0 opacity-100"
												: "pointer-events-none -translate-y-1 opacity-0"
										}`}
									>
										<button
											type="button"
											onClick={handleUseLiveLocation}
											disabled={isLocating}
											className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[#070190] text-sm transition-colors hover:bg-[#f4f6ff] disabled:cursor-not-allowed disabled:opacity-70"
										>
											<LocateFixed className="h-4 w-4" />
											{isLocating
												? "Fetching live location..."
												: "Fetch live location"}
										</button>

										<button
											type="button"
											onClick={handleBrowseOnlineEvents}
											className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[#070190] text-sm transition-colors hover:bg-[#f4f6ff]"
										>
											Browse online events
										</button>

										<div className="my-1 border-slate-100 border-t" />
										<p className="px-3 py-1 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
											Popular cities
										</p>

										{locationOptions.map((option) => (
											<button
												key={option.toLowerCase()}
												type="button"
												onClick={() => handlePickLocation(option)}
												className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
											>
												<MapPin className="h-3.5 w-3.5" />
												{option}
											</button>
										))}
									</div>
								</div>

								<Button
									type="button"
									onClick={handleSearch}
									className="h-10 w-10 rounded-full bg-[#030370] p-0 text-white shadow-none hover:bg-[#030370]/90"
									aria-label="Search events"
								>
									<Search className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				)}

				{!minimal && !isManagementRoute && (
					<nav className="hidden items-center gap-3 md:flex lg:gap-4">
						<Link
							href="/events"
							className="rounded-full border border-transparent px-4 py-2 font-semibold text-slate-700 text-sm transition-all hover:border-[#dfe3f6] hover:bg-[#f4f6ff] hover:text-[#030370]"
						>
							Discover
						</Link>
						<Link
							href="/dashboard/events/create"
							className="rounded-full border border-[#e6e9f8] bg-[#f9faff] px-4 py-2 font-semibold text-[#030370] text-sm transition-all hover:border-[#cad2f4] hover:bg-[#eef1ff]"
						>
							Create Event +
						</Link>
					</nav>
				)}

				<div className="hidden items-center gap-3 md:flex">
					<button
						type="button"
						onClick={handleNavigateToLikedEvents}
						className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-rose-500"
						aria-label="Open liked events"
					>
						<Heart className="h-4 w-4" />
					</button>

					<button
						type="button"
						onClick={handleOpenNotifications}
						className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-[#030370]"
						aria-label="Open notifications"
					>
						<Bell className="h-4 w-4" />
						{unreadCount?.count && unreadCount.count > 0 && (
							<span className="absolute top-1 right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-bold text-[10px] text-white">
								{unreadCount.count > 9 ? "9+" : unreadCount.count}
							</span>
						)}
					</button>

					{isAuthenticated ? (
						<div ref={profileMenuRef} className="relative">
							<button
								type="button"
								className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-2 pl-1.5 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff]"
								onClick={() => setIsProfileMenuOpen((prev) => !prev)}
								onMouseEnter={openProfileMenu}
								aria-label="Open profile menu"
								aria-expanded={isProfileMenuOpen}
							>
								{user?.image ? (
									<Image
										src={user.image}
										alt={user.name ? `${user.name} profile` : "User profile"}
										width={32}
										height={32}
										className="h-8 w-8 rounded-full border border-slate-200 object-cover"
									/>
								) : (
									<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e9edff] font-bold text-[#070190] text-sm">
										{profileInitial}
									</span>
								)}
								<ChevronDown
									className={`h-4 w-4 text-[#070190] transition-transform ${
										isProfileMenuOpen ? "rotate-180" : "rotate-0"
									}`}
								/>
							</button>

							<div
								role="menu"
								onMouseEnter={openProfileMenu}
								onMouseLeave={closeProfileMenuWithSlide}
								className={`absolute top-full right-0 z-50 min-w-56 pt-2 transition-all duration-200 ease-out ${
									isProfileMenuOpen
										? "pointer-events-auto translate-y-0 opacity-100"
										: "pointer-events-none -translate-y-2 opacity-0"
								}`}
							>
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(7,1,144,0.16)]">
									<div className="border-slate-100 border-b px-3 py-2.5">
										<button
											type="button"
											onClick={() =>
												handleNavigateFromProfileMenu("/dashboard")
											}
											className="flex w-full flex-col items-start gap-1 text-left"
										>
											<p className="truncate font-semibold text-[#070190] text-sm">
												{user?.name?.trim() || "My Profile"}
											</p>
											<p className="truncate text-slate-500 text-xs">
												{user?.email}
											</p>
											<p className="font-medium text-slate-400 text-xs">
												Go to user dashboard
											</p>
										</button>
									</div>

									<div className="p-2">
										{profileMenuItems.map((section) => (
											<div key={section.section}>
												{section.section && (
													<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
														{section.section}
													</p>
												)}
												{section.items.map((item) => (
													<button
														key={item.label}
														type="button"
														onClick={() =>
															handleNavigateFromProfileMenu(item.href)
														}
														className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
													>
														<UserCircle2 className="h-4 w-4" />
														{item.label}
													</button>
												))}
											</div>
										))}

										<div className="my-1 border-slate-100 border-t" />
										{userRole === "ADMIN" && (
											<>
												<div className="my-1 border-slate-100 border-t" />
												<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
													Admin Control
												</p>
												<button
													type="button"
													onClick={() =>
														handleNavigateFromProfileMenu("/dashboard/admin")
													}
													className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
												>
													<UserCircle2 className="h-4 w-4" />
													Admin Dashboard
												</button>
											</>
										)}

										<button
											type="button"
											onClick={handleLogout}
											className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-rose-600 text-sm transition-colors hover:bg-rose-50"
										>
											<LogOut className="h-4 w-4" />
											Logout
										</button>
									</div>
								</div>
							</div>
						</div>
					) : (
						<>
							<Button
								asChild
								variant="ghost"
								className="rounded-4xl border-2 border-gray-400 font-bold text-slate-600 hover:text-[#030370]"
							>
								<Link
									href={`/auth/sign-in?redirect=${encodeURIComponent(pathname || "/")}`}
								>
									Login
								</Link>
							</Button>
							<Button
								asChild
								className="rounded-full bg-[#030370] px-6 font-bold text-white shadow-[0_0_5px_0_rgba(71,114,230,1)] transition-all hover:bg-[#030370]/90 active:scale-95"
							>
								<Link
									href={`/auth/sign-up?redirect=${encodeURIComponent(pathname || "/")}`}
								>
									Sign Up
								</Link>
							</Button>
						</>
					)}
				</div>

				{isAuthenticated ? (
					<div className="relative flex items-center gap-2 md:hidden">
						{isSearchVisible && (
							<Button
								type="button"
								onClick={() => window.location.assign("/events")}
								className="h-9 w-9 rounded-full bg-[#030370] p-0 text-white shadow-none hover:bg-[#030370]/90"
								aria-label="Open events search"
							>
								<Search className="h-4 w-4" />
							</Button>
						)}

						<button
							type="button"
							onClick={handleNavigateToLikedEvents}
							className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-rose-500"
							aria-label="Open liked events"
						>
							<Heart className="h-4 w-4" />
						</button>

						<button
							type="button"
							onClick={handleOpenNotifications}
							className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-[#030370]"
							aria-label="Open notifications"
						>
							<Bell className="h-4 w-4" />
							{unreadCount?.count && unreadCount.count > 0 && (
								<span className="absolute top-1 right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-bold text-[10px] text-white">
									{unreadCount.count > 9 ? "9+" : unreadCount.count}
								</span>
							)}
						</button>

						<button
							type="button"
							onClick={() => setIsMobileMenuOpen((prev) => !prev)}
							className="flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pr-1.5 pl-1"
							aria-label="Toggle profile menu"
							aria-expanded={isMobileMenuOpen}
						>
							{user?.image ? (
								<Image
									src={user.image}
									alt={user.name ? `${user.name} profile` : "User profile"}
									width={32}
									height={32}
									className="h-8 w-8 rounded-full border border-slate-200 object-cover"
								/>
							) : (
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e9edff] font-bold text-[#070190] text-sm">
									{profileInitial}
								</span>
							)}
							<ChevronDown
								className={`h-4 w-4 text-[#070190] transition-transform ${
									isMobileMenuOpen ? "rotate-180" : "rotate-0"
								}`}
							/>
						</button>

						{isMobileMenuOpen && (
							<div className="absolute top-full right-0 z-50 min-w-56 pt-2">
								<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(7,1,144,0.16)]">
									<div className="border-slate-100 border-b px-3 py-2.5">
										<button
											type="button"
											onClick={() =>
												handleNavigateFromProfileMenu("/dashboard")
											}
											className="flex w-full flex-col items-start gap-1 text-left"
										>
											<p className="truncate font-semibold text-[#070190] text-sm">
												{user?.name?.trim() || "My Profile"}
											</p>
											<p className="truncate text-slate-500 text-xs">
												{user?.email}
											</p>
										</button>
									</div>

									<div className="p-2">
										{profileMenuItems.map((section) => (
											<div key={section.section}>
												{section.section && (
													<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
														{section.section}
													</p>
												)}
												{section.items.map((item) => (
													<button
														key={item.label}
														type="button"
														onClick={() =>
															handleNavigateFromProfileMenu(item.href)
														}
														className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
													>
														<UserCircle2 className="h-4 w-4" />
														{item.label}
													</button>
												))}
											</div>
										))}

										<div className="my-1 border-slate-100 border-t" />

										<button
											type="button"
											onClick={handleLogout}
											className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-rose-600 text-sm transition-colors hover:bg-rose-50"
										>
											<LogOut className="h-4 w-4" />
											Logout
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="flex items-center gap-2 md:hidden">
						{isSearchVisible && (
							<Button
								type="button"
								onClick={() => window.location.assign("/events")}
								className="h-9 w-9 rounded-full bg-[#030370] p-0 text-white shadow-none hover:bg-[#030370]/90"
								aria-label="Open events search"
							>
								<Search className="h-4 w-4" />
							</Button>
						)}

						<button
							type="button"
							onClick={handleNavigateToLikedEvents}
							className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-rose-500"
							aria-label="Open liked events"
						>
							<Heart className="h-4 w-4" />
						</button>

						<Button
							asChild
							variant="ghost"
							className="rounded-4xl border-2 border-gray-400 font-bold text-slate-600 hover:text-[#030370]"
						>
							<Link
								href={`/auth/sign-in?redirect=${encodeURIComponent(pathname || "/")}`}
							>
								Login
							</Link>
						</Button>
						<Button
							asChild
							className="rounded-full bg-[#030370] px-6 font-bold text-white shadow-[0_0_5px_0_rgba(71,114,230,1)] transition-all hover:bg-[#030370]/90 active:scale-95"
						>
							<Link
								href={`/auth/sign-up?redirect=${encodeURIComponent(pathname || "/")}`}
							>
								Sign Up
							</Link>
						</Button>
					</div>
				)}
			</div>

			<NotificationDrawer
				isOpen={isNotificationsOpen}
				onClose={() => setIsNotificationsOpen(false)}
			/>
		</header>
	);
}
