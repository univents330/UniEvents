import { HostSidebar } from "@/shared/ui/host-sidebar";
import { Navbar } from "@/shared/ui/navbar";

export default function HostLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-linear-to-b from-[#f7fbff] via-[#f3f8ff] to-[#edf5ff]">
			<Navbar minimal />
			<HostSidebar />
			{/* Main Content Area - scrollable on the right */}
			<main className="fixed top-16 right-0 bottom-0 left-64 overflow-y-auto overflow-x-hidden">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-[#d7e8ff]/70 via-[#e9f2ff]/35 to-transparent"
				/>
				<div className="relative px-6 pt-2 pb-6 md:px-8 md:pt-3 md:pb-8">
					{children}
				</div>
			</main>
		</div>
	);
}
