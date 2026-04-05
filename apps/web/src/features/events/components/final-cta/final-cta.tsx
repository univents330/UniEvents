import { 
  IconBrandWhatsapp, 
  IconShieldLock, 
  IconBolt, 
  IconBell, 
  IconArrowBackUp 
} from "@tabler/icons-react";
import styles from "./final-cta.module.scss";

export function FinalCTA() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<h2 className={styles.title}>
					Your next unforgettable <span>experience is out there.</span>
				</h2>

				<p className={styles.subtitle}>
					Join 85,000+ attendees who discover and book events on UniEvents every month. Free to join, free to explore.
				</p>

				<div className={styles.actions}>
					<a href="/events" className={styles.btnPrimary}>
						Browse Events
					</a>
					<a href="/host/events/new" className={styles.btnSecondary}>
						Create Free Events
					</a>
				</div>

				<div className={styles.features}>
					<div className={styles.featureRow}>
						<div className={styles.featureItem}>
							<span>🔒</span> Secure Payments
						</div>
						<div className={styles.featureItem}>
							<IconBrandWhatsapp size={20} color="#25D366" stroke={2} /> WhatsApp Delivery
						</div>
						<div className={styles.featureItem}>
							<span>⚡</span> Instant QR Pass
						</div>
						<div className={styles.featureItem}>
							<span>🔔</span> Event reminders
						</div>
					</div>
					<div className={styles.featureRow}>
						<div className={styles.featureItem}>
							<IconArrowBackUp size={20} color="#3D03B8" stroke={2} /> Easy Cancellation
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
