"use client";

import { useState } from "react";
import styles from "./how-it-works.module.scss";

const STEPS = [
	{
		id: 1,
		title: "Find something you love",
		description: "Search by name, filter by category, date, or \"free entry\". Save events to revisit them later",
	},
	{
		id: 2,
		title: "Pick your tickets",
		description: "Choose ticket type and quality. Solo or as a group. Apply coupons for group or early bird discounts.",
	},
	{
		id: 3,
		title: "Pay in seconds",
		description: "Secure Cashfree checkouts. UPI, cards and netbanking all supported. Payment confirmed instantly.",
	},
	{
		id: 4,
		title: "Show up, scan, enjoy",
		description: "Your QR pass lands on WhatsApp & email immediately. At the gate, one scan- and you're in.",
	},
];

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(1);

	return (
		<section className={styles.section}>
			<div className={styles.container}>
				<div className={styles.headerTitle}>
					<span>How it works</span>
				</div>

				<h2 className={styles.mainTitle}>
					Book your seat in <span>4 simple steps</span>
				</h2>

				<p className={styles.subtitle}>
					Designed to get you from "interested" to "confirmed" with minimum friction.
				</p>

				<div className={styles.contentRow}>
					<div className={styles.stepsColumn}>
						{STEPS.map((step) => (
							<div
								key={step.id}
								className={`${styles.stepItem} ${activeStep === step.id ? styles.activeItem : ""}`}
								onClick={() => setActiveStep(step.id)}
								style={{ cursor: "pointer" }}
							>
								<div className={`${styles.numberBox} ${activeStep === step.id ? styles.active : ""}`}>
									{step.id}
								</div>
								<div className={styles.stepText}>
									<h3 className={styles.stepTitle}>{step.title}</h3>
									<p className={styles.stepDescription}>{step.description}</p>
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
