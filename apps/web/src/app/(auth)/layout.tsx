import { Navbar } from "@/shared/ui/navbar";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
				<div className="pt-8 sm:pt-10 md:pt-12">{children}</div>
			</main>
		</div>
	);
}
