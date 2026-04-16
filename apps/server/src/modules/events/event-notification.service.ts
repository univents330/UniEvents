import type { Event, User } from "@voltaze/db";
import { sendZohoTicketMail } from "@/common/utils/mailer";

type ModerationAction = "APPROVE" | "REJECT";

type EventModerationNotificationInput = {
	event: Pick<Event, "id" | "name">;
	creator: Pick<User, "email" | "name">;
	action: ModerationAction;
	reason?: string;
};

export class EventNotificationService {
	async sendModerationDecision(input: EventModerationNotificationInput) {
		const actionText = input.action === "APPROVE" ? "approved" : "rejected";
		const subject = `Your event "${input.event.name}" has been ${actionText}`;

		const html =
			input.action === "APPROVE"
				? `
					<h2>Great news! Your event has been approved</h2>
					<p>Hi ${input.creator.name || "there"},</p>
					<p>Your event <strong>"${input.event.name}"</strong> has been reviewed and approved by our admin team.</p>
					<p>Your event is now live and visible to all users on the UniEvent platform.</p>
					<p>You can view your event and manage it in your host dashboard.</p>
					<p>Best regards,<br/>UniEvent Team</p>
				`
				: `
					<h2>Event Moderation Update</h2>
					<p>Hi ${input.creator.name || "there"},</p>
					<p>Unfortunately, your event <strong>"${input.event.name}"</strong> has been rejected during moderation review.</p>
					${input.reason ? `<p><strong>Reason:</strong> ${input.reason}</p>` : ""}
					<p>Please review our event guidelines and submit again.</p>
					<p>Best regards,<br/>UniEvent Team</p>
				`;

		await sendZohoTicketMail({
			to: input.creator.email,
			subject,
			text: `Your event "${input.event.name}" has been ${actionText}.`,
			html,
		});
	}
}

export const eventNotificationService = new EventNotificationService();
