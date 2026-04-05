import { IconArrowRight } from "@tabler/icons-react";
import styles from "./group-booking.module.scss";

export function GroupBooking() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<div className={styles.banner}>
					<div className={styles.content}>
						<div className={styles.tag}>
							Group Booking
						</div>

						<h2 className={styles.title}>
							Coming with your crew?<br />
							Save more together.
						</h2>

						<p className={styles.description}>
							Book 5+ Tickets In A Single Transaction And Unlock Automatic Discounts. One Payment — Everyone Gets Their Own QR Pass Instantly.
						</p>

						<div className={styles.highlight}>
							Get Upto 20% Off
						</div>
					</div>

					<div className={styles.actions}>
						<a href="/events" className={styles.btnPrimary}>
							Book Now <IconArrowRight size={20} />
						</a>
						<a href="/faq?tab=group-booking" className={styles.btnSecondary}>
							Learn More
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
