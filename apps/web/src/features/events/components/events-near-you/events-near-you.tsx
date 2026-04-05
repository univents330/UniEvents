"use client";

import { useState } from "react";
import { IconMapPin, IconCalendarEvent, IconUsers, IconArrowRight } from "@tabler/icons-react";
import { useEvents } from "../../hooks/use-events";
import styles from "./events-near-you.module.scss";

const FILTERS = [
	{ id: "all", label: "All Events" },
	{ id: "weekend", label: "This Weekend" },
	{ id: "free", label: "Free" },
	{ id: "paid", label: "Paid" },
	{ id: "tech", label: "Tech" },
	{ id: "workshop", label: "Workshop" },
	{ id: "hackathon", label: "Hackathon" },
];

export function EventsNearYou() {
	const [activeFilter, setActiveFilter] = useState("all");

	// Prepare filters for API
	const getApiFilters = () => {
		const filters: any = {
			page: 1,
			limit: 6,
			sortBy: "startDate",
			sortOrder: "asc",
		};

		if (activeFilter === "free") filters.type = "FREE";
		if (activeFilter === "paid") filters.type = "PAID";
		
		if (activeFilter === "weekend") {
			const now = new Date();
			const friday = new Date(now.setDate(now.getDate() + (5 - now.getDay())));
			friday.setHours(18, 0, 0, 0);
			const sunday = new Date(friday);
			sunday.setDate(friday.getDate() + 2);
			sunday.setHours(23, 59, 59, 999);
			
			filters.startDateFrom = friday;
			filters.startDateTo = sunday;
		}

		if (["tech", "workshop", "hackathon"].includes(activeFilter)) {
			filters.search = activeFilter;
		}

		return filters;
	};

	const { data, isLoading } = useEvents(getApiFilters());
	const events = data?.data || [];

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<div className={styles.header}>
					<h2 className={styles.title}>
						Events Happening <span>Near You</span>
					</h2>
					<p className={styles.description}>
						Handpicked Events Across The Cities For You. All For You Mood And Vibes.
					</p>
				</div>

				<div className={styles.filters}>
					{FILTERS.map((filter) => (
						<button
							key={filter.id}
							className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.activeFilter : ""}`}
							onClick={() => setActiveFilter(filter.id)}
						>
							{filter.label}
						</button>
					))}
				</div>

				{isLoading ? (
					<div className={styles.grid}>
						{[...Array(6)].map((_, i) => (
							<div key={i} className={styles.card} style={{ height: "400px", backgroundColor: "#f1f5f9" }} />
						))}
					</div>
				) : events.length > 0 ? (
					<div className={styles.grid}>
						{events.map((event) => (
							<div key={event.id} className={styles.card}>
								<div className={styles.imageWrapper}>
									<img
										src={event.coverUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80"}
										alt={event.name}
										className={styles.image}
									/>
									{event.type === "FREE" && (
										<span className={styles.statusBadge}>Free</span>
									)}
									<span className={styles.badge}>
										{event.mode === "ONLINE" ? "Online" : "Offline"}
									</span>
								</div>

								<div className={styles.cardContent}>
									<h3 className={styles.eventTitle}>{event.name}</h3>

									<div className={styles.infoRow}>
										<div className={styles.infoItem}>
											<IconCalendarEvent size={16} />
											<span>{formatDate(event.startDate)}</span>
										</div>
										<div className={styles.infoItem}>
											<IconMapPin size={16} />
											<span>{event.venueName}</span>
										</div>
										<div className={styles.infoItem}>
											<IconUsers size={16} />
											<span>Multiple Seats</span>
										</div>
									</div>
								</div>

								<div className={styles.cardFooter}>
									<div className={styles.price}>
										{event.type === "FREE" ? "FREE" : "₹399"}
									</div>
									<a href={`/events/${event.slug}`} className={styles.bookBtn}>
										Book Now <IconArrowRight size={16} />
									</a>
								</div>
							</div>
						))}
					</div>
				) : (
					<div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "#fff", borderRadius: "32px" }}>
						<p style={{ fontSize: "18px", fontWeight: "600", color: "#64748b" }}>No events found for this filter.</p>
					</div>
				)}
			</div>
		</section>
	);
}
