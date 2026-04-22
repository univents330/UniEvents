"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { authClient } from "@/core/lib/auth-client";

type SessionUser = {
	id: string;
	name: string | null;
	email: string;
	emailVerified: boolean;
	image: string | null;
	role: string;
};

type AuthState = {
	user: SessionUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	signOut: () => Promise<void>;
	refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
	user: null,
	isLoading: true,
	isAuthenticated: false,
	signOut: async () => {},
	refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<SessionUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchSession = useCallback(async () => {
		try {
			const session = await authClient.getSession();
			if (session?.data?.user) {
				setUser(session.data.user as unknown as SessionUser);
			} else {
				setUser(null);
			}
		} catch {
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSession();
	}, [fetchSession]);

	const signOut = useCallback(async () => {
		await authClient.signOut();
		setUser(null);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated: user !== null,
				signOut,
				refresh: fetchSession,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
