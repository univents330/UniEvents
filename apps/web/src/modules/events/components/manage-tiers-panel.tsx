"use client";

import { useState } from "react";
import { useAuth } from "@/core/providers/auth-provider";
import { Button } from "@/shared/ui/button";
import {
	useCreateEventTicketTier,
	useEventTicketTiers,
} from "../hooks/use-events";

export function ManageTiersPanel({
	eventId,
	eventUserId,
}: {
	eventId: string;
	eventUserId: string;
}) {
	const { user } = useAuth();
	const tiersQuery = useEventTicketTiers(eventId);
	const createTierEntry = useCreateEventTicketTier(eventId);

	const [isAdding, setIsAdding] = useState(false);
	const [name, setName] = useState("");
	const [price, setPrice] = useState(0);
	const [maxQuantity, setMaxQuantity] = useState(100);

	if (!user || user.id !== eventUserId) {
		return null; // Only the host can manage tiers
	}

	const handleAddTier = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createTierEntry.mutateAsync({
				name,
				price,
				maxQuantity,
			});
			setIsAdding(false);
			setName("");
			setPrice(0);
			setMaxQuantity(100);
		} catch (err: unknown) {
			const error = err instanceof Error ? err.message : "Failed to add tier";
			alert(error);
		}
	};

	return (
		<div className="panel mt-8 space-y-6 border-indigo-500 border-t-4 p-6 md:p-8">
			<div>
				<h3 className="font-bold text-[#0e1838] text-xl">
					Host Controls: Manage Tiers
				</h3>
				<p className="mt-1 text-[#5f6984] text-sm">
					Configure standard tickets, VIP passes, and pricing bounds.
				</p>
			</div>

			{tiersQuery.isLoading ? (
				<div className="text-[#5f6984] text-sm">Loading tiers...</div>
			) : (
				<div className="space-y-4">
					{tiersQuery.data?.data.map((tier) => (
						<div
							key={tier.id}
							className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
						>
							<div>
								<span className="font-bold text-[#0e1838]">{tier.name}</span>
								<div className="mt-1 text-[#5f6984] text-sm">
									Price: ₹{tier.price} • Capacity: {tier.maxQuantity}
								</div>
							</div>
							<span className="rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-700 text-xs">
								Active
							</span>
						</div>
					))}

					{tiersQuery.data?.data.length === 0 && (
						<div className="text-[#5f6984] text-sm italic">
							No ticket tiers exist yet. Users cannot checkout until you create
							one!
						</div>
					)}
				</div>
			)}

			{!isAdding ? (
				<Button
					onClick={() => setIsAdding(true)}
					variant="ghost"
					className="w-full"
				>
					+ Create Ticket Tier
				</Button>
			) : (
				<form
					onSubmit={handleAddTier}
					className="space-y-4 rounded-xl border border-indigo-100 bg-[#f8fbff] p-4"
				>
					<div>
						<label
							htmlFor="tier-name"
							className="font-bold text-[#5f6984] text-xs uppercase"
						>
							Tier Name (e.g. VIP, Standard)
						</label>
						<input
							id="tier-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="mt-1 h-10 w-full rounded-lg border px-3 outline-none"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="tier-price"
								className="font-bold text-[#5f6984] text-xs uppercase"
							>
								Price (₹)
							</label>
							<input
								id="tier-price"
								type="number"
								value={price}
								onChange={(e) => setPrice(Number(e.target.value))}
								min={0}
								required
								className="mt-1 h-10 w-full rounded-lg border px-3 outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="tier-capacity"
								className="font-bold text-[#5f6984] text-xs uppercase"
							>
								Total Capacity
							</label>
							<input
								id="tier-capacity"
								type="number"
								value={maxQuantity}
								onChange={(e) => setMaxQuantity(Number(e.target.value))}
								min={1}
								required
								className="mt-1 h-10 w-full rounded-lg border px-3 outline-none"
							/>
						</div>
					</div>
					<div className="flex gap-3">
						<Button type="submit" disabled={createTierEntry.isPending}>
							Save Tier
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsAdding(false)}
						>
							Cancel
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
