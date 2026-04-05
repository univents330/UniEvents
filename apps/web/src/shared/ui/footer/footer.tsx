import Link from "next/link";
import styles from "./footer.module.scss";

export function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.grid}>
					<div className={styles.brand}>
						<h2 className={styles.logo}>UniEvents</h2>
						<p className={styles.description}>
							Discover and book events you'll actually love attending- college fests, tech talks, concerts, workshops & community meetups
						</p>
					</div>

					<div className={styles.column}>
						<h3 className={styles.heading}>Discover</h3>
						<div className={styles.links}>
							<Link href="/events" className={styles.link}>Browse All Events</Link>
							<Link href="/events?category=tech" className={styles.link}>Tech Events</Link>
							<Link href="/events?category=music" className={styles.link}>Music & Concerts</Link>
							<Link href="/events?category=college" className={styles.link}>College Fests</Link>
							<Link href="/events?type=free" className={styles.link}>Free Events</Link>
						</div>
					</div>

					<div className={styles.column}>
						<h3 className={styles.heading}>Account</h3>
						<div className={styles.links}>
							<Link href="/register" className={styles.link}>Sign Up Free</Link>
							<Link href="/login" className={styles.link}>Log in</Link>
							<Link href="/profile/bookings" className={styles.link}>My Bookings</Link>
							<Link href="/profile/passes" className={styles.link}>My Passes</Link>
							<Link href="/profile/settings" className={styles.link}>Profile Settings</Link>
						</div>
					</div>

					<div className={styles.column}>
						<h3 className={styles.heading}>Help</h3>
						<div className={styles.links}>
							<Link href="/help" className={styles.link}>Help Centre</Link>
							<Link href="/refund" className={styles.link}>Refund Policy</Link>
							<Link href="/contact" className={styles.link}>Contact Us</Link>
							<Link href="/sponsor" className={styles.link}>Sponsor Request</Link>
							<Link href="/about" className={styles.link}>About UniEvents</Link>
							<Link href="/host" className={styles.link}>Host an Event</Link>
						</div>
					</div>
				</div>

				<div className={styles.divider} />

				<div className={styles.bottomBar}>
					<Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
					<Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
					<Link href="/cookie-policy" className={styles.bottomLink}>Cookie Policy</Link>
				</div>
			</div>
		</footer>
	);
}
