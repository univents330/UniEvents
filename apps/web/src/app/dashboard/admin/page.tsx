import type { Metadata } from "next";
import { AdminEventsView } from "@/modules/admin/views/admin-events-view";

export const metadata: Metadata = {
	title: "Admin Approvals | UniEvent",
	description: "Approve pending events",
};

export default function AdminPage() {
	return <AdminEventsView />;
}
