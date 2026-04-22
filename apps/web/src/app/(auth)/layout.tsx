export default function AuthGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen overflow-hidden bg-[#fcfdff] font-jakarta">
			{/* Brand Background Elements - Restored */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-[-5%] left-[-10%] h-[1200px] w-[1200px] rounded-full bg-[#0f3dd9]/10 blur-[140px]" />
				<div className="absolute top-[15%] right-[-15%] h-[1000px] w-[1000px] rounded-full bg-indigo-500/10 blur-[120px]" />
				<div className="absolute bottom-0 left-[-5%] h-[900px] w-[900px] rounded-full bg-blue-600/10 blur-[100px]" />

				{/* Sharp Grid Pattern Overlay */}
				<div
					className="absolute inset-0 opacity-[0.05]"
					style={{
						backgroundImage:
							"linear-gradient(#0f3dd9 1.5px, transparent 1.5px), linear-gradient(90deg, #0f3dd9 1.5px, transparent 1.5px)",
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			{/* Main Auth Content */}
			<div className="relative z-10 min-h-screen w-full">{children}</div>
		</div>
	);
}
