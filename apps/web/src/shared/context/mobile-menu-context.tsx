"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface MobileMenuContextType {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(
	undefined,
);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);
	const toggle = () => setIsOpen((prev) => !prev);

	return (
		<MobileMenuContext.Provider value={{ isOpen, open, close, toggle }}>
			{children}
		</MobileMenuContext.Provider>
	);
}

export function useMobileMenu() {
	const context = useContext(MobileMenuContext);
	if (context === undefined) {
		throw new Error("useMobileMenu must be used within MobileMenuProvider");
	}
	return context;
}
