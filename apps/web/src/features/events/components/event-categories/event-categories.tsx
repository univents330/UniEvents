"use client";

import Link from "next/link";
import {
	IconDeviceLaptop,
	IconMusic,
	IconSchool,
	IconUsers,
	IconPalette,
	IconFriends,
} from "@tabler/icons-react";
import styles from "./event-categories.module.scss";

const CATEGORIES = [
	{
		id: "tech-dev",
		title: "Tech & Dev",
		count: "234 events",
		Icon: IconDeviceLaptop,
		color: "#000",
	},
	{
		id: "music",
		title: "Music",
		count: "187 events",
		Icon: IconMusic,
		color: "#000",
	},
	{
		id: "college-fests",
		title: "College Fests",
		count: "40 events",
		Icon: IconSchool,
		color: "#FF9F1C",
	},
	{
		id: "workshops",
		title: "Workshops",
		count: "158 events",
		Icon: IconUsers,
		color: "#4B5563",
	},
	{
		id: "art-culture",
		title: "Art & Culture",
		count: "80 events",
		Icon: IconPalette,
		color: "#FF4D6D",
	},
	{
		id: "meetups",
		title: "Meetups",
		count: "108 events",
		Icon: IconFriends,
		color: "#FFB703",
	},
];

export function EventCategories() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.header}>What are you into?</h2>

				<div className={styles.grid}>
					{CATEGORIES.map((category) => (
						<Link
							key={category.id}
							href={`/events?category=${category.id}`}
							className={styles.card}
						>
							<div className={styles.iconWrapper}>
								<category.Icon
									className={styles.icon}
									size={64}
									stroke={1.5}
									color={category.color}
								/>
							</div>
							<h3 className={styles.title}>{category.title}</h3>
							<span className={styles.count}>{category.count}</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
