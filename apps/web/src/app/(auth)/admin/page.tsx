import type { Route } from "next";
import { redirect } from "next/navigation";

export default function AdminHomePage() {
	redirect("/admin/dashboard" as Route);
}
