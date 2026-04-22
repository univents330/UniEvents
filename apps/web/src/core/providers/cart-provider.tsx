"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

export type CartItem = {
	id: string;
	eventId: string;
	eventName: string;
	tierId: string;
	tierName: string;
	price: number; // in paisa
	quantity: number;
	image?: string;
};

type CartContextType = {
	items: CartItem[];
	addItem: (item: CartItem) => void;
	removeItem: (tierId: string) => void;
	updateQuantity: (tierId: string, quantity: number) => void;
	clearCart: () => void;
	totalItems: number;
	totalPrice: number;
	cartStartedAt: number | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [cartStartedAt, setCartStartedAt] = useState<number | null>(null);

	// Load cart from localStorage on mount
	useEffect(() => {
		const savedCart = localStorage.getItem("unievent_cart");
		const savedTime = localStorage.getItem("unievent_cart_time");

		if (savedCart) {
			try {
				setItems(JSON.parse(savedCart));
			} catch (e) {
				console.error("Failed to parse cart", e);
			}
		}

		if (savedTime) {
			setCartStartedAt(Number.parseInt(savedTime, 10));
		}
	}, []);

	// Save cart and time to localStorage on change
	useEffect(() => {
		localStorage.setItem("unievent_cart", JSON.stringify(items));
		if (items.length > 0 && !cartStartedAt) {
			const now = Date.now();
			setCartStartedAt(now);
			localStorage.setItem("unievent_cart_time", now.toString());
		} else if (items.length === 0) {
			setCartStartedAt(null);
			localStorage.removeItem("unievent_cart_time");
		}
	}, [items, cartStartedAt]);

	const addItem = useCallback((newItem: CartItem) => {
		setItems((prev) => {
			const existing = prev.find((item) => item.tierId === newItem.tierId);
			if (existing) {
				return prev.map((item) =>
					item.tierId === newItem.tierId
						? { ...item, quantity: item.quantity + newItem.quantity }
						: item,
				);
			}
			return [...prev, newItem];
		});
	}, []);

	const removeItem = useCallback((tierId: string) => {
		setItems((prev) => prev.filter((item) => item.tierId !== tierId));
	}, []);

	const updateQuantity = useCallback((tierId: string, quantity: number) => {
		setItems((prev) => {
			if (quantity <= 0) return prev.filter((item) => item.tierId !== tierId);
			return prev.map((item) =>
				item.tierId === tierId ? { ...item, quantity } : item,
			);
		});
	}, []);

	const clearCart = useCallback(() => {
		setItems([]);
		setCartStartedAt(null);
		localStorage.removeItem("unievent_cart_time");
	}, []);

	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	return (
		<CartContext.Provider
			value={{
				items,
				addItem,
				removeItem,
				updateQuantity,
				clearCart,
				totalItems,
				totalPrice,
				cartStartedAt,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
