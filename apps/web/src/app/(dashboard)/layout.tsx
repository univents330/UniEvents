import { AppShell } from "@/core/app-shell";

export default function DashboardGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AppShell>{children}</AppShell>;
}
