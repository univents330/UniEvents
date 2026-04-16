import { toast } from "sonner";
import { addNotification } from "./notification-center";

type NotificationColor = "green" | "red" | "blue" | "amber";

type NotificationOptions = {
	title: string;
	message?: string;
	color?: NotificationColor;
};

export function showNotification({
	title,
	message,
	color,
}: NotificationOptions) {
	addNotification({ title, message, color: color ?? "green" });

	if (color === "red") {
		toast.error(title, { description: message });
		return;
	}

	if (color === "blue") {
		toast.info(title, { description: message });
		return;
	}

	if (color === "amber") {
		toast.warning(title, { description: message });
		return;
	}

	toast.success(title, { description: message });
}
