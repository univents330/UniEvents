import { env } from "@voltaze/env/server";

interface BrevoEmailOptions {
	to: string | string[];
	subject: string;
	htmlContent: string;
	textContent?: string;
}

export async function sendEmailViaBrevo({
	to,
	subject,
	htmlContent,
	textContent,
}: BrevoEmailOptions) {
	if (!env.BREVO_API_KEY || !env.BREVO_MAIL_FROM) {
		console.warn(
			"Brevo email not configured. Set BREVO_API_KEY and BREVO_MAIL_FROM.",
		);
		return;
	}

	const toEmails = Array.isArray(to) ? to : [to];

	const payload = {
		sender: {
			name: "Voltaze",
			email: env.BREVO_MAIL_FROM,
		},
		to: toEmails.map((email) => ({ email })),
		subject,
		htmlContent,
		textContent,
	};

	try {
		const response = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				"api-key": env.BREVO_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
		}

		const data = await response.json();
		console.log("Email sent successfully via Brevo:", data.messageId);
		return data;
	} catch (error) {
		console.error("Error sending email via Brevo:", error);
		throw error;
	}
}
