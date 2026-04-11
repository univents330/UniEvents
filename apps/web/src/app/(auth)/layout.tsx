import { Navbar } from "@/shared/ui/navbar";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<main className="pt-16">{children}</main>
		</div>
	);
}
