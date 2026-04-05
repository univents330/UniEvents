"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconMapPin, IconSearch } from "@tabler/icons-react";

import { Navbar } from "@/shared/ui/navbar";
import styles from "./event-hero.module.scss";

export function EventHero() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [location, setLocation] = useState<string>("chandigarh");

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.append("search", searchQuery);
		if (location) params.append("location", location);

		router.push(`/events?${params.toString()}`);
	};

	const handleDiscoverEvents = () => {
		router.push("/events");
	};

	return (
		<div className={styles.hero}>
			<Navbar />

			<main className={styles.main}>
				<div className={styles.contentWrapper}>
					<div className={styles.heroContent}>
						<h1 className={styles.title1}>
							Discover and Book
						</h1>

						<h2 className={styles.title2}>
							Events Effortlessly
						</h2>

						<p className={styles.description}>
							From Front Row Fan To Sold Out Host
							<br />
							Everything You Need To Live And Lead The Experience.
						</p>

						<button
							onClick={handleDiscoverEvents}
							className={styles.btnHero}
						>
							Discover Events
						</button>

						<div className={styles.searchWrapper}>
							<div className={styles.searchBar}>
								<div className={styles.searchInner}>
									<div className={styles.searchInputGroup}>
										<IconSearch size={20} className={styles.icon} stroke={2} />
										<input
											type="text"
											placeholder="Search For Events Near You"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSearch();
											}}
											className={styles.input}
										/>
									</div>

									<div className={styles.divider} />

									<div className={styles.locationGroup}>
										<IconMapPin size={18} className={styles.icon} stroke={2} />
										<select
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											className={styles.select}
										>
											<option value="chandigarh">Chandigarh</option>
											<option value="delhi">Delhi</option>
											<option value="mumbai">Mumbai</option>
											<option value="bangalore">Bangalore</option>
										</select>
									</div>

									<div className={styles.searchBtnGroup}>
										<button
											onClick={handleSearch}
											className={styles.btnSearch}
										>
											Search
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
