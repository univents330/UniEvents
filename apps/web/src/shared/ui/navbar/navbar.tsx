"use client";

import {
	Bell,
	CheckCheck,
	ChevronDown,
	Globe,
	Heart,
	LocateFixed,
	LogOut,
	MapPin,
	Search,
	Trash2,
	UserCircle2,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useLogout } from "@/features/auth";
import { SearchSuggestions } from "@/features/events/components/search-suggestions/search-suggestions";
import { useEventSearch } from "@/features/events/hooks/use-event-search";
import type { AppRole } from "@/shared/hooks";
import { useLiveLocation } from "@/shared/hooks/use-live-location";
import {
	type AppNotification,
	clearNotifications,
	getUnreadNotificationCount,
	markAllNotificationsAsRead,
	markNotificationAsRead,
	setNotificationScope,
	subscribeNotifications,
} from "@/shared/lib/notification-center";
import { startTopLoader } from "@/shared/lib/top-loader-events";

function getProfileInitial(
	name: string | null | undefined,
	email: string | null | undefined,
) {
	const base = name?.trim() || email?.trim() || "U";
	return base.charAt(0).toUpperCase();
}

function formatNotificationTime(dateIso: string) {
	const now = Date.now();
	const ts = new Date(dateIso).getTime();
	const diffMinutes = Math.max(1, Math.floor((now - ts) / (1000 * 60)));

	if (diffMinutes < 60) {
		return `${diffMinutes}m ago`;
	}

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}

	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}d ago`;
}

interface NavbarProps {
	minimal?: boolean;
}

export function Navbar({ minimal = false }: NavbarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: user } = useCurrentUser();
	const logoutMutation = useLogout();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
	const [showScrolledSearch, setShowScrolledSearch] = useState(false);
	const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [notifications, setNotifications] = useState<AppNotification[]>([]);
	const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
	const { location, setLocation, detectLocation, isLocating } = useLiveLocation(
		{
			fallback: "Patiala",
		},
	);
	const profileMenuRef = useRef<HTMLDivElement | null>(null);
	const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const profileCloseTimerRef = useRef<number | null>(null);
	const searchMenuRef = useRef<HTMLDivElement | null>(null);
	const notificationsPanelRef = useRef<HTMLElement | null>(null);

	const { suggestions, isLoading: isSuggestionsLoading } =
		useEventSearch(searchQuery);

	const locationOptions = useMemo(() => {
		const defaults = ["Patiala", "Chandigarh", "Delhi", "Mumbai"];

		if (
			location &&
			!defaults.some((item) => item.toLowerCase() === location.toLowerCase())
		) {
			return [location, ...defaults];
		}

		return defaults;
	}, [location]);

	const closeMobileMenu = () => {
		setIsMobileProfileMenuOpen(false);
	};

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
		setNotificationScope(user?.id);
	}, [user?.id]);

	useEffect(() => {
		const unsubscribe = subscribeNotifications((items) => {
			setNotifications(items);
			setUnreadNotificationCount(getUnreadNotificationCount());
		});

		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			const isInsideDesktopMenu = profileMenuRef.current?.contains(target);
			const isInsideMobileMenu = mobileProfileMenuRef.current?.contains(target);
			const isInsideLocationMenu = locationMenuRef.current?.contains(target);
			const isInsideSearchMenu = searchMenuRef.current?.contains(target);

			if (!isInsideDesktopMenu && !isInsideMobileMenu && !isInsideSearchMenu) {
				setIsProfileMenuOpen(false);
				setIsMobileProfileMenuOpen(false);
				setShowSearchSuggestions(false);
			}

			if (!isInsideLocationMenu && !isInsideSearchMenu) {
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

		startTopLoader();
		router.push(`/events?${params.toString()}`);
		closeLocationMenu();
		closeMobileMenu();
	};

	const handleUseLiveLocation = async () => {
		await detectLocation();
		closeLocationMenu();
	};

	const handleBrowseOnlineEvents = () => {
		setLocation("Online");
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set("search", searchQuery);
		}

		params.set("location", "online");
		params.set("mode", "ONLINE");
		startTopLoader();
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
		startTopLoader();
		window.location.assign(href);
		setIsProfileMenuOpen(false);
		setIsMobileProfileMenuOpen(false);
		closeMobileMenu();
	};

	const handleLogout = () => {
		setIsProfileMenuOpen(false);
		setIsMobileProfileMenuOpen(false);
		closeMobileMenu();
		logoutMutation.mutate();
	};

	const handleOpenNotifications = () => {
		setIsNotificationsOpen(true);
		markAllNotificationsAsRead();
	};

	const handleNavigateToLikedEvents = () => {
		startTopLoader();
		window.location.assign("/liked-events");
	};

	interface MenuSection {
		section?: string;
		items: Array<{ label: string; href: string }>;
	}

	const isManagementRoute =
		pathname.startsWith("/host") || pathname.startsWith("/admin");
	const isUserRoute = pathname.startsWith("/user");
	const userRole = user?.role as AppRole | undefined;
	const dashboardHref = "/user/dashboard";
	const dashboardLabel = "User Dashboard";

	const profileMenuItems = useMemo(() => {
		const sections: MenuSection[] = [
			{
				section: "User Dashboard",
				items: [
					{ label: "Dashboard", href: dashboardHref },
					{ label: "Tickets", href: "/user/tickets" },
					{ label: "Liked", href: "/liked-events" },
					{ label: "Settings", href: "/user/settings" },
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
	}, [minimal, dashboardHref, isManagementRoute]);

	const profileInitial = getProfileInitial(user?.name, user?.email);
	const alwaysShowSearch = pathname !== "/";
	const isSearchVisible =
		!minimal && !isManagementRoute && (alwaysShowSearch || showScrolledSearch);

	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-slate-100 border-b bg-white/80 backdrop-blur-md">
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
					<Link
						href="/"
						className="flex shrink-0 items-center gap-2"
						onClick={closeMobileMenu}
					>
						<Image
							src="/assets/logo.webp"
							alt="UniEvent logo"
							width={50}
							height={40}
							priority
						/>
						<span className="font-black text-2xl text-[#070190] leading-none tracking-tight md:text-[29px]">
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
									<div ref={searchMenuRef} className="relative w-full">
										<Input
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onFocus={() => setShowSearchSuggestions(true)}
											onKeyDown={handleSearchKeyDown}
											placeholder="Search events..."
											className="h-auto border-none bg-transparent p-0 font-medium text-[15px] text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
										/>
										<SearchSuggestions
											suggestions={suggestions}
											isOpen={showSearchSuggestions && searchQuery.length > 0}
											isLoading={isSuggestionsLoading}
											onSuggestionSelect={() => {
												setShowSearchSuggestions(false);
												setSearchQuery("");
											}}
										/>
									</div>
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
											<Globe className="h-4 w-4" />
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
							href="/events"
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
						{unreadNotificationCount > 0 && (
							<span className="absolute top-1 right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-bold text-[10px] text-white">
								{unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
							</span>
						)}
					</button>

					{user ? (
						<div ref={profileMenuRef} className="relative">
							<button
								type="button"
								className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-2 pl-1.5 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff]"
								onClick={() => setIsProfileMenuOpen((prev) => !prev)}
								onMouseEnter={openProfileMenu}
								aria-label="Open profile menu"
								aria-expanded={isProfileMenuOpen}
							>
								{user.image ? (
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
												handleNavigateFromProfileMenu(dashboardHref)
											}
											className="flex w-full flex-col items-start gap-1 text-left"
										>
											<p className="truncate font-semibold text-[#070190] text-sm">
												{user.name?.trim() || "My Profile"}
											</p>
											<p className="truncate text-slate-500 text-xs">
												{user.email}
											</p>
											<p className="font-medium text-slate-400 text-xs">
												Go to {dashboardLabel.toLowerCase()}
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
										<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
											Host Control
										</p>
										<button
											type="button"
											onClick={() =>
												handleNavigateFromProfileMenu("/host/dashboard")
											}
											className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
										>
											<UserCircle2 className="h-4 w-4" />
											Host Dashboard
										</button>
										{userRole === "ADMIN" && (
											<>
												<div className="my-1 border-slate-100 border-t" />
												<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
													Admin Control
												</p>
												<button
													type="button"
													onClick={() =>
														handleNavigateFromProfileMenu("/admin/dashboard")
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
											disabled={logoutMutation.isPending}
											className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-rose-600 text-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
										>
											<LogOut className="h-4 w-4" />
											{logoutMutation.isPending ? "Logging out..." : "Logout"}
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
								<Link href="/login">Login</Link>
							</Button>
							<Button
								asChild
								className="rounded-full bg-[#030370] px-6 font-bold text-white shadow-[0_0_5px_0_rgba(71,114,230,1)] transition-all hover:bg-[#030370]/90 active:scale-95"
							>
								<Link href="/signup">Sign Up</Link>
							</Button>
						</>
					)}
				</div>

				{user ? (
					<div
						ref={mobileProfileMenuRef}
						className="relative flex items-center gap-2 md:hidden"
					>
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
							{unreadNotificationCount > 0 && (
								<span className="absolute top-1 right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-bold text-[10px] text-white">
									{unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
								</span>
							)}
						</button>

						<button
							type="button"
							onClick={() => setIsMobileProfileMenuOpen((prev) => !prev)}
							className="flex items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pr-1.5 pl-1"
							aria-label="Toggle profile menu"
							aria-expanded={isMobileProfileMenuOpen}
						>
							{user.image ? (
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
									isMobileProfileMenuOpen ? "rotate-180" : "rotate-0"
								}`}
							/>
						</button>

						<div
							className={`absolute top-full right-0 z-50 min-w-56 pt-2 transition-all duration-200 ease-out ${
								isMobileProfileMenuOpen
									? "pointer-events-auto translate-y-0 opacity-100"
									: "pointer-events-none -translate-y-2 opacity-0"
							}`}
						>
							<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(7,1,144,0.16)]">
								<div className="border-slate-100 border-b px-3 py-2.5">
									<button
										type="button"
										onClick={() => handleNavigateFromProfileMenu(dashboardHref)}
										className="flex w-full flex-col items-start gap-1 text-left"
									>
										<p className="truncate font-semibold text-[#070190] text-sm">
											{user.name?.trim() || "My Profile"}
										</p>
										<p className="truncate text-slate-500 text-xs">
											{user.email}
										</p>
										<p className="font-medium text-slate-400 text-xs">
											Go to {dashboardLabel.toLowerCase()}
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
									<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
										Host Control
									</p>
									<button
										type="button"
										onClick={() =>
											handleNavigateFromProfileMenu("/host/dashboard")
										}
										className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-slate-700 text-sm transition-colors hover:bg-[#f4f6ff] hover:text-[#030370]"
									>
										<UserCircle2 className="h-4 w-4" />
										Host Dashboard
									</button>
									{userRole === "ADMIN" && (
										<>
											<div className="my-1 border-slate-100 border-t" />
											<p className="px-3 py-2 font-semibold text-[11px] text-slate-500 uppercase tracking-wide">
												Admin Control
											</p>
											<button
												type="button"
												onClick={() =>
													handleNavigateFromProfileMenu("/admin/dashboard")
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
										disabled={logoutMutation.isPending}
										className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-rose-600 text-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
									>
										<LogOut className="h-4 w-4" />
										{logoutMutation.isPending ? "Logging out..." : "Logout"}
									</button>
								</div>
							</div>
						</div>
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

						<button
							type="button"
							onClick={handleOpenNotifications}
							className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff] hover:text-[#030370]"
							aria-label="Open notifications"
						>
							<Bell className="h-4 w-4" />
							{unreadNotificationCount > 0 && (
								<span className="absolute top-1 right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-bold text-[10px] text-white">
									{unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
								</span>
							)}
						</button>

						<button
							type="button"
							className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[#070190] transition-colors hover:border-[#ccd5f7] hover:bg-[#f7f9ff]"
							onClick={() => window.location.assign("/login")}
							aria-label="Open login or signup"
						>
							<UserCircle2 className="h-5 w-5" />
						</button>
					</div>
				)}
			</div>

			{isNotificationsOpen && (
				<button
					type="button"
					className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/30"
					aria-label="Close notifications panel"
					onClick={() => setIsNotificationsOpen(false)}
				/>
			)}

			<aside
				ref={notificationsPanelRef}
				className={`fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] w-full max-w-sm border-slate-200 border-l bg-white shadow-2xl transition-transform duration-300 ${
					isNotificationsOpen ? "translate-x-0" : "translate-x-full"
				}`}
				aria-hidden={!isNotificationsOpen}
			>
				<div className="flex h-full flex-col">
					<div className="border-slate-100 border-b px-6 py-5">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h2 className="font-bold text-3xl text-[#10023a]">
									Notifications
								</h2>
								<p className="mt-1 text-[#332a4d] text-sm">
									Stay up to date on important information
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsNotificationsOpen(false)}
								className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
								aria-label="Close notifications"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="mt-4 flex items-center gap-2">
							<button
								type="button"
								onClick={() => markAllNotificationsAsRead()}
								className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-[#1d2b57] text-xs transition-colors hover:bg-slate-50"
							>
								<CheckCheck className="h-3.5 w-3.5" />
								Mark all read
							</button>
							<button
								type="button"
								onClick={() => clearNotifications()}
								className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-[#1d2b57] text-xs transition-colors hover:bg-slate-50"
							>
								<Trash2 className="h-3.5 w-3.5" />
								Clear all
							</button>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto px-4 py-4">
						{notifications.length === 0 ? (
							<div className="flex h-full flex-col items-center justify-center px-4 text-center">
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f2f4ff]">
									<Bell className="h-9 w-9 text-[#6f77a8]" />
								</div>
								<p className="font-bold text-2xl text-[#10023a]">
									Nothing to see here (yet)!
								</p>
								<p className="mt-2 max-w-xs text-[#332a4d] text-lg leading-snug">
									We&apos;ll be sure to let you know when we have something for
									you
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{notifications.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => markNotificationAsRead(item.id)}
										className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-slate-50"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate font-semibold text-[#0f1f4d] text-sm">
													{item.title}
												</p>
												{item.message && (
													<p className="mt-1 line-clamp-2 text-slate-600 text-xs">
														{item.message}
													</p>
												)}
											</div>
											<div className="flex items-center gap-2">
												{!item.isRead && (
													<span
														className={`inline-block h-2.5 w-2.5 rounded-full ${
															item.color === "red"
																? "bg-rose-500"
																: item.color === "blue"
																	? "bg-sky-500"
																	: "bg-emerald-500"
														}`}
													/>
												)}
												<span className="whitespace-nowrap text-[11px] text-slate-500">
													{formatNotificationTime(item.createdAt)}
												</span>
											</div>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</aside>
		</header>
	);
}
