"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.scss";

export function Navbar() {
	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<div className={styles.logoContainer}>
					<Link href="/">
						<Image src="/assets/logo.webp" alt="logo" width={56} height={56} priority />
					</Link>
				</div>

				<nav className={styles.navLinks}>
					<Link href="/events" className={styles.navLink}>Discover</Link>
					<Link href="/how-it-works" className={styles.navLink}>How it works</Link>
					<Link href="/my-tickets" className={styles.navLink}>My Tickets</Link>
					<Link href="/my-bookings" className={styles.navLink}>My Bookings</Link>
				</nav>

				<div className={styles.authButtons}>
					<Link href="/login" className={styles.loginBtn}>Login</Link>
					<Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
				</div>
			</div>
		</header>
	);
}
