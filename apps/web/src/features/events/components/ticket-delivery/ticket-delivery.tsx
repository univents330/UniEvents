import { 
  IconBrandWhatsapp, 
  IconMail, 
  IconBell, 
  IconLock 
} from "@tabler/icons-react";
import styles from "./ticket-delivery.module.scss";

const FEATURES = [
	{
		id: 1,
		title: "WhatsApp Delivery",
		description: "QR pass lands in your whatsapp instantly after payment. Always within reach",
		Icon: IconBrandWhatsapp,
		iconColor: "#25D366",
	},
	{
		id: 2,
		title: "Email PDF Ticket",
		description: "A beautifully formatted PDF ticket in your inbox — download or open on the day",
		Icon: IconMail,
		iconColor: "#EA4335",
	},
	{
		id: 3,
		title: "Day-before reminder",
		description: "We ping you via WhatsApp the day before so you never forget something you paid for.",
		Icon: IconBell,
		iconColor: "#FFB703",
	},
	{
		id: 4,
		title: "Temper-proof QR",
		description: "Every QR is cryptographically signed. No duplicates, no fakes — instant gate scan.",
		Icon: IconLock,
		iconColor: "#F59E0B",
	},
];

export function TicketDelivery() {
	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<div className={styles.headerTitle}>
					<span>Your Ticket</span>
				</div>

				<h2 className={styles.mainTitle}>
					Delivered to you <span>the second you book</span>
				</h2>

				<p className={styles.subtitle}>
					No printing, no hunting for emails. Your ticket is wherever you are.
				</p>

				<div className={styles.contentRow}>
					<div className={styles.featuresColumn}>
						{FEATURES.map((feature) => (
							<div key={feature.id} className={styles.featureItem}>
								<div className={styles.iconBox}>
									<feature.Icon 
                    size={32} 
                    color={feature.iconColor} 
                    stroke={1.5} 
                  />
								</div>
								<div className={styles.featureText}>
									<h3 className={styles.featureTitle}>{feature.title}</h3>
									<p className={styles.featureDescription}>{feature.description}</p>
								</div>
							</div>
						))}
					</div>

					<div className={styles.imageColumn}>
						<div className={styles.mockupWrapper}>
							<img
								src="/assets/iphone.webp"
								alt="iPhone Ticket Mockup"
								className={styles.iphoneImage}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
