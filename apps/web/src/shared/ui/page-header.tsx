interface PageHeaderProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="min-w-0">
				<h1 className="font-bold text-2xl text-[#071a78]">{title}</h1>
				{description && <p className="mt-1 text-slate-600">{description}</p>}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}
