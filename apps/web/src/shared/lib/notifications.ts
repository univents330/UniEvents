import { toast } from "sonner";

type NotificationColor = "green" | "red" | "blue";

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
	if (color === "red") {
		toast.error(title, { description: message });
		return;
	}

	if (color === "blue") {
		toast.info(title, { description: message });
		return;
	}

	toast.success(title, { description: message });
}
