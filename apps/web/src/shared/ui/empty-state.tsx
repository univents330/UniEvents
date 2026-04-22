export function EmptyState({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: React.ReactNode;
}) {
	return (
		<section className="panel-soft py-12 text-center">
			<p className="display-font font-bold text-2xl text-[#12204a]">{title}</p>
			<p className="mx-auto mt-3 max-w-xl text-[#5f6984]">{description}</p>
			{children ? <div className="mt-6">{children}</div> : null}
		</section>
	);
}
